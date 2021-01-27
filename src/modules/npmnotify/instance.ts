import { Message, MessageEmbed } from 'discord.js';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { GiyoBot } from './../../bot';

import { ModuleInstance } from './../../interfaces/moduleInstance';
import npmSubscriber from './npmSubscriber';
import { npmPackage } from '../../database/entities/npmPackage';

export default class npmnotify implements ModuleInstance {
    public info = {
        id: 0,
        name: 'npmNotify',
        cmds: [
            {
                prefixes: ['npm'],
                cmdDescription: 'Lists all subscribed packages in this channel.',
                methodName: 'executenpm',
                admin: false
            },
            {
                prefixes: ['npmadd'],
                cmdDescription: '`npmadd discord.js` - Subscribe to a new npm package.',
                methodName: 'executenpmAdd',
                admin: false
            },
            {
                prefixes: ['npmremove'],
                cmdDescription: '`npmremove discord.js` - Remove the subscription of a npm package.',
                methodName: 'executenpmRemove',
                admin: false
            },
            {
                prefixes: ['npmadmin'],
                cmdDescription: 'Admin command to get ALL subscribed packages',
                methodName: 'executenpmAdmin',
                admin: true
            }
        ],
        moduleDescription: 'Get a notification if a npm packages releases a new version',
    }

    private _npmPackageRepository: Repository<npmPackage>;

    private _npmSubscriber: npmSubscriber;

    constructor(private _bot: GiyoBot) {
        dayjs.extend(duration);
        this._npmPackageRepository = this._bot.getDatabase().getnpmPackageRepository();
        this._npmSubscriber = new npmSubscriber(this._bot);
        this._npmSubscriber.scheduleChecks();
    }

    public async executenpm(msg: Message): Promise<void> {
        const packages = await this._npmPackageRepository.find({ where: { channelId: msg.channel.id } });
        if (packages.length === 0) {
            msg.channel.send(':x: No subscriptions found in this channel.');
            return;
        }
        const embed = new MessageEmbed();
        embed.setTitle(`Subscribed npm packages in this channel`);
        embed.setColor(0xEED4E0);

        let packagesString = '';
        for (let npmPackage of packages) {
            packagesString += `${npmPackage.name} - :hash: \`${npmPackage.latest}\`\n`;
        }
        embed.addField('Packages', packagesString);
        msg.channel.send(embed);
    }

    public async executenpmAdd(msg: Message): Promise<void> {
        let npmPackageName = msg.content.split(' ')[1];
        if (!npmPackageName) {
            msg.channel.send(':x: Please provide a npm package name');
            return;
        }
        npmPackageName = npmPackageName.toLowerCase();
        if ((await this._npmPackageRepository.findOne({ where: { channelId: msg.channel.id, name: npmPackageName } }))) {
            msg.channel.send(':warning: Already subscribed to this package');
            return;
        }
        const json = await this._npmSubscriber.getPackageVersion(npmPackageName);
        if (!json.latest) {
            msg.channel.send(`Package \`${npmPackageName}\` not found...`);
            return;
        }
        await this._npmPackageRepository.save({ channelId: msg.channel.id, name: npmPackageName, latest: json.latest });
        msg.channel.send(`:green_circle: Added ${npmPackageName}. Current version is :hash:\`${json.latest}\``);
    }

    public async executenpmRemove(msg: Message): Promise<void> {
        let npmPackageName = msg.content.split(' ')[1];
        if (!npmPackageName) {
            msg.channel.send(':x: Please provide a npm package name');
            return;
        }
        npmPackageName = npmPackageName.toLowerCase();

        const npmPackage = await this._npmPackageRepository.findOne({ where: { channelId: msg.channel.id, name: npmPackageName } });
        if (!npmPackage) {
            msg.channel.send(':warning: Not subscribed to this package');
            return;
        }
        await this._npmPackageRepository.remove(npmPackage);
        msg.channel.send(`:green_circle: Removed ${npmPackage.name}`);
    }

    public async executenpmAdmin(msg: Message): Promise<void> {
        const packages = await this._npmPackageRepository.find();
        if (packages.length === 0) {
            msg.channel.send(':x: No subscriptions found.');
            return;
        }
        let packagesString = '**npm packages**\n';
        for (let npmPackage of packages) {
            packagesString += `(\`${npmPackage.channelId}\`) - ${npmPackage.name}\n`;
        }
        msg.channel.send(packagesString);
    }
}
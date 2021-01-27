import { Repository } from 'typeorm';
import nodeFetch from 'node-fetch';
import ns from 'node-schedule';

import { GiyoBot } from '../../bot';
import { npmPackage } from '../../database/entities/npmPackage';
import { TextChannel } from 'discord.js';

export default class npmSubscriber {
    private _npmPackageRepository: Repository<npmPackage>;

    constructor(private _bot: GiyoBot) {
        this._npmPackageRepository = this._bot.getDatabase().getnpmPackageRepository();
    }

    public scheduleChecks() {
        ns.scheduleJob('0 * * * *', () => {
            this._checkVersions();
        });
    }

    private async _checkVersions() {
        const packages = await this._npmPackageRepository.find();
        if (packages.length === 0) {
            return;
        }
        for (const npmPackage of packages) {
            const newnpmPackage = await this.getPackageVersion(npmPackage.name);
            if (newnpmPackage.latest !== npmPackage.latest) {
                const channel = this._bot.getClient().channels.cache.get(npmPackage.channelId) as TextChannel;
                if (channel) {
                    channel.send(`New version of **${npmPackage.name}** available!:tada:\n~~${npmPackage.latest}~~ :arrow_right: \`${newnpmPackage.latest}\``);
                } else {
                    console.error(`Channel ${npmPackage.channelId} not found...`);
                }
                await this._npmPackageRepository.save({ id: npmPackage.id, name: npmPackage.name, channelId: npmPackage.channelId, latest: newnpmPackage.latest });
            }
        }
    }

    async getPackageVersion(npmPackage: string): Promise<any> {
        const response = await nodeFetch(`https://registry.npmjs.org/-/package/${npmPackage}/dist-tags`);
        const json = await response.json();
        return json;
    }
}
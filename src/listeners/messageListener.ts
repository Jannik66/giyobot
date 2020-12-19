import { Message, Client } from 'discord.js';
import { GiyoBot } from './../bot';

export default class messageListener {

    private _client: Client;

    private _prefix = '-';

    constructor(private _bot: GiyoBot) {
        this._client = this._bot.getClient();
    }

    public async evalMessage(msg: Message) {
        if (msg.author.bot) return;

        if (msg.content.startsWith(`<@${this._client.user.id}>`) || msg.content.startsWith(`<@!${this._client.user.id}`)) {
            msg.channel.send(`My prefix is \`${this._prefix}\`\nGet a list of commands with \`${this._prefix}help\`\n\nYou can also DM me with commands without the prefix :p`);
            return;
        }

        if (!msg.content.startsWith(this._prefix) && msg.channel.type !== 'dm') return;

        let args;
        if (msg.content.toLowerCase().startsWith(this._prefix.toLowerCase())) {
            args = msg.content.slice(this._prefix.length).split(/ +/);
        } else {
            args = msg.content.split(/ +/);
        }

        const commandString = args.shift().toLowerCase();

        const module = this._bot.getModules().find(m => {
            return m.instance.info.cmds.find(cmd => cmd.prefixes.includes(commandString));
        });

        if (!module) {
            if (msg.channel.type === 'dm') {
                msg.channel.send('I don\'t know what you mean >.<\nYou can get a list of commands by typing `help`');
            }
            return;
        }

        const command = module.instance.info.cmds.find(cmd => cmd.prefixes.includes(commandString));

        if (!module.enabled) {
            msg.channel.send('Oh no, this module is currently disabled.');
            return;
        }

        if (command.admin && msg.author.id !== process.env.GIYOBOT_OWNERID) {
            msg.channel.send('Only my master can execute this command.');
            return;
        }

        try {
            // @ts-ignore
            module.instance[command.methodName](msg);
        } catch (error) {
            console.error(error);
            msg.channel.send(`Error...`);
        }
    }
}
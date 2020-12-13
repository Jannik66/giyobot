import { Client } from 'discord.js';

import readyListener from './listeners/readyListener';

import config from './config';

export class GiyoBot {
    // Discord client of the bot
    private _client: Client;

    // listeners
    private _readyListener: readyListener;

    getClient(): Client {
        return this._client;
    }

    // initial start method
    public async start() {
        // create new client
        this._client = new Client();

        this._readyListener = new readyListener(this);

        // init event listeners
        this.initEvents();

        this._client.login(config.botToken);
    }

    // init event listeners
    private initEvents() {
        this._client.on('ready', async () => this._readyListener.evalReady());
    }
}
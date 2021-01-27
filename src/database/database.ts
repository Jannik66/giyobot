import { ConnectionOptions, createConnection, Connection, Repository } from 'typeorm';

import { npmPackage } from './entities/npmPackage';

// database options
const options: ConnectionOptions = {
    type: 'sqlite',
    database: `./sqlite/GiyoBot.db`,
    entities: [npmPackage],
    logging: true
}

export class BotDatabase {

    private _connection: Connection;

    private _npmPackageRepository: Repository<npmPackage>;

    public async initConnection() {
        // init connection to database
        this._connection = await createConnection(options);

        // check if all tables are correct and generate scaffolding
        await this._connection.synchronize();

        // save repository to property
        this._npmPackageRepository = this._connection.getRepository(npmPackage);

        return this;
    }

    // getter for the database connection
    public getConnection() {
        return this._connection;
    }

    public getnpmPackageRepository() {
        return this._npmPackageRepository;
    }

}
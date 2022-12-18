import { MongoDbConfig, DualEnv } from '../interfaces/configs';

export const databaseConfig: DualEnv<MongoDbConfig> = {
    prod: {
        uri: 'mongodb://localhost:27017',
    },
    dev: {
        uri: 'mongodb://localhost:27017',
    },
};

export interface MongoDbConfig {
    uri: string;
}

export interface DualEnv<T> {
    prod: T
    dev: T
}

export interface StatusResponse {
    message: string;
    error: boolean;
}
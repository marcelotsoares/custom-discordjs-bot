import { CustomBotClient } from '../classes/custom-bot-client.class';

export interface ICustomBotClient {
    customBotClient: CustomBotClient;
}

export interface IGuildObject {
    name: string;
    id: string;
    icon: string;
}

export interface ICreateEmbed {
    title: string;
    description: string;
    guild: IGuildObject;
}

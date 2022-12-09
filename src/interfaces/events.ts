import {Client, Message} from "discord.js";

export interface EventDef {
    name: string;
    executeOnce: boolean;
    handler: (client: Client, message: Message) => Promise<void>
}
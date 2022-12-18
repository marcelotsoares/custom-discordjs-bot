import {Collection, TextChannel} from 'discord.js'
import {UserController} from "../src/controllers/user.controller";
import {LevelController} from "../src/controllers/level.controller";
import {MarketplaceController} from '../src/controllers/marketplace.controller';

interface ICommandProps {
    commandName: string;
    channel?: TextChannel;
    lastMessagesHash?: string[];
    lastTimeCommandWasExec: number;
}

interface ICommandChannel {
    commands: Array<ICommandProps>;
}

interface IUserTransaction {
    users: Map<user_id, ITransactitonNFTs>
}

declare module "discord.js" {
    export interface Client {
        botUsers: Map<user_id, ICommandChannel>;
        commands?: Collection<string, any>;
        userController: UserController;
        levelController: LevelController;
        marketplaceController: MarketplaceController;
    }
}
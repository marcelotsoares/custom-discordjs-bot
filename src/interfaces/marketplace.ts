import { MessageEmbed, MessageActionRow } from 'discord.js';
import { IUser } from './user';

export interface IMarketplace {
    itemId: string;
    itemName: string;
    description: string;
    price: number;
}

export interface IMarketplaceConfig {
    items: Array<IMarketplace>;
}

export interface ICreateMenuMarketplace {
    embed: MessageEmbed;
    rowSelectMenu: MessageActionRow;
}

export type MarketplaceBuyItem = Pick<IMarketplace, 'price'>;

export interface IMarketplaceBuyItem extends MarketplaceBuyItem, IUser {}

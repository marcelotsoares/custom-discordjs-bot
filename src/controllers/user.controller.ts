import { CustomBotClient } from "../classes/custom-bot-client.class";
import { NotFoundException } from "../classes/errors";
import { BotUserModel, InventoryItem } from "../models/bot-user";
import { ICustomBotClient } from "../interfaces/custom-bot";
import { ICreateUser, IUserIventory, IUserPayment, UserModel } from "../interfaces/user";

export interface IUserConstructor extends ICustomBotClient {
    botUserModel: typeof BotUserModel;
}

export class UserController {
    readonly customBotClient: CustomBotClient;
    
    readonly #botUserModel: typeof BotUserModel;

    constructor(props: IUserConstructor) {
        this.customBotClient = props.customBotClient
        this.#botUserModel = props.botUserModel
    };

    async getUserByDiscordId(discordId: string): Promise<UserModel | never> {
        const user = await this.#botUserModel.findOne({discordId: discordId})
        
        if(!user) {
            throw new NotFoundException('User with this discordId');
        };

        return user
    };

    async createUser({discordId, discordName}: ICreateUser): Promise<never | void> {
        await this.#botUserModel.create({
            discordId: discordId,
            discordName: discordName,
            services: {
                membership: {
                    active: false,
                    expiration: new Date(0),
                    transactions: []
                },
            },
            xp: 0,
            level: 1,
            inventory: [],
            coins: 0
        });
    };

    async tryGetInventoryItem({user, itemId}: IUserIventory): Promise<InventoryItem>  {
        console.log(`[tryGetInventoryItem] discordName: ${user.discordName} : itemId: ${itemId}`);

        const itemInventory = user.inventory.find(item => item.itemId === itemId);
        if(!itemInventory) {
            throw new NotFoundException("Item with that Id in user's inventory");
        };

        return itemInventory
    };

    async tryUserPayment({user, coins}: IUserPayment): Promise<never | void> {
        console.log(`[tryPayment] discordId: ${user.discordId}, item_price: ${coins}`);
        const updateCoins = user.coins - coins;
        console.log(`[tryPayment] updateCoins: ${updateCoins}`);
        if (updateCoins < 0) {
            throw new NotFoundException('Coins needed for payment');
        };

        user.coins = updateCoins;

        await user.save();
    };

    async giveInventoryItem({user, itemId}: IUserIventory): Promise<void> {
        const foundItem = user.inventory.find(item => item.itemId === itemId)
        if(!foundItem) {
            user.inventory.push({
                itemId: itemId,
                qtd: 1
            });
        } else {
            foundItem.qtd++
        };
        
        await user.save();
    };
};
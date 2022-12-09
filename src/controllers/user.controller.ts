import {CustomBotClient} from "../classes/custom-bot-client.class.js";
import {StatusResponse} from "../interfaces/configs.js";
import {BotUserModel} from "../models/bot-user.js";
import { BuyMarketplace, MarketplaceInfo } from "./marketplace.controller.js";

type tryUserPayment = Required<Omit<BuyMarketplace, 'itemId'>>

export class UserController {
    customBotClient: CustomBotClient;

    constructor() {}

    async tryGetInventoryItem(props: MarketplaceInfo) {
        const {discordId, itemId} = props

        console.log(`[tryGetInventoryItem] ${discordId}:${itemId}`);
        const user = await this.getUserDataByDiscordId(discordId);
        if(!user) {
           return false
        };


        const itemInventory = user.inventory.find(u => u.item === itemId);
        if(!itemInventory) {
           return false
        };

        console.log('itemInventory', itemInventory);
        if(itemInventory.qtd > 0) {
            itemInventory.qtd--
            await user.save()
            return true
        };
    };

    async createUsers(discord_id: string, discord_name: string) {
        const user = await BotUserModel.findOne({ discordId: discord_id });

        if (user) {
            return {
                error: true,
                message: '[level:controller:createUsers] A user with this discordId already exists'
            }
        };

        const tryCreatedUser = await BotUserModel.create({
            discordId: discord_id,
            discordName: discord_name,
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

        console.log(tryCreatedUser);
    };

    async tryUserPayment(props: tryUserPayment): Promise<StatusResponse> {
        const {discordId, price} = props

        const user = await BotUserModel.findOne({ discordId: discordId });
        if (!user) {
            return {
                message: `User não encontraddo!`,
                error: true
            }
        };

        console.log(`[tryPayment] discordId: ${discordId}, item_price: ${price}`);
        const updateCoins = user.coins - price;
        console.log(`[tryPayment] updateCoins: ${updateCoins}`);
        if (updateCoins < 0) {
            return {
                message: `Não foi possivel realizar o pagamento. userCoins: ${user.coins} - priceItem: ${price}`,
                error: true
            }
        };

        user.coins = updateCoins;

        await user.save();

        return {
            message: 'Compra realizada com sucesso!',
            error: false
        }
    };

    async getUserDataByDiscordId(discord_id: string) {
        const user = await BotUserModel.findOne({discordId: discord_id});
        if(!user) {
            return false
        };

        return user
    };

    async giveInventoryItem(props: MarketplaceInfo) {
        const {discordId, itemId} = props
        const user = await BotUserModel.findOne({discordId: discordId})
        if (user) {
            const foundItem = user.inventory.find(u => u.item === itemId)
            if(!foundItem) {
                user.inventory.push({
                    item: itemId,
                    qtd: 1
                })
            } else {
                foundItem.qtd++
            }
            await user.save()
        };
    };
};
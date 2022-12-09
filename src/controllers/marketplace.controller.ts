import { CustomBotClient } from "../classes/custom-bot-client.class";
import { MarketplaceConfig } from "../config/marketplace.config.js";
import { StatusResponse } from "../interfaces/configs";

export type BuyMarketplace = Partial<Pick<IMarketplace, 'itemId' | 'discordId' | 'price'>>

export type MarketplaceInfo = Required<Pick<BuyMarketplace, 'itemId' | 'discordId'>>

export class MarketplaceController {
    customBotClient: CustomBotClient;

    constructor() {}

    async getItemPriceByItemId(itemId: string) {
        const item = MarketplaceConfig.items.find(item => item.itemId == itemId)
        if(!item) {
            return false
        }

        return item.price
    }

    async tryToBuyItemOnMarketplace(props: MarketplaceInfo): Promise<StatusResponse> {
        const {discordId, itemId} = props
        const client = this.customBotClient
        const userController = client.userController
        const user = await userController.getUserDataByDiscordId(discordId)
        if(!user) {
            return {
                message: 'Usuario não encontrado',
                error: true
            }
        }

        const priceItem = await this.getItemPriceByItemId(itemId)
        if(!priceItem) {
            return {
                message: 'Não consegui encontrar o preço do item, então não é possivel finalizar com a compra!',
                error: true
            }
        }

        const tryBuyItem = await userController.tryUserPayment({
            discordId: discordId,
            price: priceItem
        });
        
        if(tryBuyItem.error) {
            return {
                message: tryBuyItem.message,
                error: true
            }
        }
        
        return {
            message: tryBuyItem.message,
            error: false
        }
    }
}
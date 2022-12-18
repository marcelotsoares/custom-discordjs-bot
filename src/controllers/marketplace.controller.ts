import { CustomBotClient } from "../classes/custom-bot-client.class";
import { MarketplaceConfig } from "../config/marketplace.config";
import { IMarketplace, MarketplaceItemsConfig, BuyOnMarketplace } from "../interfaces/marketplace";
import { NotFoundException } from "../classes/errors";
import { ICustomBotClient } from "interfaces/custom-bot";

export class MarketplaceController {
    readonly customBotClient: CustomBotClient;

    constructor(props: ICustomBotClient) {
        this.customBotClient = props.customBotClient
    }

    async getItemById({ itemId }: Pick<IMarketplace, 'itemId'>): Promise<MarketplaceItemsConfig | never> {
        const item = MarketplaceConfig.items.find(item => item.itemId == itemId)
        if(!item) {
            throw new NotFoundException('Item with this id')
        }

        return item
    }

    async tryToBuyItemOnMarketplace({user, itemConfig}: BuyOnMarketplace): Promise<void> {
        try {
            const userController = this.customBotClient.userController
            
            const payment = await userController.tryUserPayment({
                user: user,
                coins: itemConfig.price
            });

            console.log('payment ->', payment)
        } catch (error) {
            throw error
        }
    }
}
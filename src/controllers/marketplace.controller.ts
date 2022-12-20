import { CustomBotClient } from '../classes/custom-bot-client.class';
import { MarketplaceConfig } from '../config/marketplace.config';
import { NotFoundException } from '../classes/errors';
import { ICustomBotClient } from '../interfaces/custom-bot';
import { IMarketplace, IMarketplaceBuyItem } from '../interfaces/marketplace';

export class MarketplaceController {
    readonly customBotClient: CustomBotClient;

    constructor(props: ICustomBotClient) {
        this.customBotClient = props.customBotClient;
    }

    async getItemById({ itemId }: Pick<IMarketplace, 'itemId'>): Promise<IMarketplace | never> {
        const item = MarketplaceConfig.items.find((item) => item.itemId == itemId);
        if (!item) {
            throw new NotFoundException('Item with this id');
        }

        return item;
    }

    async tryToBuyItemOnMarketplace({ user, price, itemId }: IMarketplaceBuyItem) {
        try {
            const userController = this.customBotClient.userController;

            await userController.tryUserPayment({
                user: user,
                coins: price,
            });

            await userController.giveInventoryItem({
                user: user,
                itemId: itemId,
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
        }
    }
}

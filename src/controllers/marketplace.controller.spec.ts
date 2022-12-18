import { MarketplaceConfig } from "../config/marketplace.config";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceItemsConfig } from "../interfaces/marketplace"
import { UserController } from "../controllers/user.controller";
import { mockBotUser } from "../models/__mocks__/bot-user.mock";
import { UserModel } from "../interfaces/user"

import { CustomBotClient } from '../classes/custom-bot-client.class';
import { Client } from "discord.js";
import { NotFoundException } from "../classes/errors";
jest.mock('discord.js')


const buildMarketplaceController = async () => {
    const mockCustomBotClient = {
        userController: {
            tryUserPayment: jest.fn()
        }
    }

    const marketplaceController = new MarketplaceController({
        customBotClient: (mockCustomBotClient as unknown) as CustomBotClient
    })

    return {
        mockCustomBotClient,
        marketplaceController
    }
}

describe('marketplaceController', () => {
    describe('getItemById', () => {
        it('should return an item if found', async () => {
            const {marketplaceController} = await buildMarketplaceController()
            const maketplaceConfig: MarketplaceItemsConfig = MarketplaceConfig.items[0]
            const validItemId = maketplaceConfig.itemId
            const getItem = await marketplaceController.getItemById({itemId: validItemId})

            expect(getItem).toMatchObject(maketplaceConfig)
        });

        it('should throw an exception when does not find the item', async () => {
            const {marketplaceController} = await buildMarketplaceController()
            const getItem = marketplaceController.getItemById({itemId: ''})

            await expect(
                getItem
            ).rejects.toThrow('Item with this id not found')
        })
    });

    describe('tryToBuyItemOnMarketplace', () => {
        it('should be possible to buy the item', async () => {
            const {marketplaceController, mockCustomBotClient} = await buildMarketplaceController()

            const maketplaceConfig: MarketplaceItemsConfig = MarketplaceConfig.items[0]

            const userPayment = mockCustomBotClient.userController.tryUserPayment
            userPayment.mockResolvedValue(true)

            const user = (mockBotUser as unknown) as UserModel
            const buyItem = await marketplaceController.tryToBuyItemOnMarketplace({
                user: user,
                itemConfig: maketplaceConfig
            });

            expect(buyItem).toBeUndefined()
            expect(userPayment).toBeCalledTimes(1)
            userPayment.mockReset()
        });
        
        it('should throw an expectation when it gives an error', async () => {
            const {marketplaceController, mockCustomBotClient} = await buildMarketplaceController()

            const maketplaceConfig: MarketplaceItemsConfig = MarketplaceConfig.items[0]
            const rejectPromise = new NotFoundException('Coins needed for payment')

            const userPayment = mockCustomBotClient.userController.tryUserPayment
            userPayment.mockResolvedValue(Promise.reject(rejectPromise))
            
            const user = (mockBotUser as unknown) as UserModel
            const buyItem = marketplaceController.tryToBuyItemOnMarketplace({
                user: user,
                itemConfig: maketplaceConfig
            });

            await expect(
                buyItem
            ).rejects.toThrow('Coins needed for payment')

            await expect(
                buyItem
            ).rejects.toBeInstanceOf(NotFoundException)

            expect(userPayment).toBeCalledTimes(1)
            userPayment.mockReset()
        });
    });
});
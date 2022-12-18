import { UserController } from './user.controller';
import { CustomBotClient } from '../classes/custom-bot-client.class';
import { BotUserModel } from '../models/bot-user';
import {
    mockBotUser,
    mockBotUserModel,
} from '../models/__mocks__/bot-user.mock';
import { NotFoundException } from '../classes/errors';

jest.mock('../classes/custom-bot-client.class');

const buildUserController = () => {
    const CustomBotClientMock = CustomBotClient as jest.Mock<CustomBotClient>;
    const customBotClientMocked =
        new CustomBotClientMock() as jest.Mocked<CustomBotClient>;

    const userController = new UserController({
        customBotClient: customBotClientMocked,
        botUserModel: mockBotUserModel as unknown as typeof BotUserModel,
    });

    return userController;
};

describe('userController', () => {
    describe('getUserByDiscordId', () => {
        it('should find a existing user', async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(mockBotUser);

            const user = await userController.getUserByDiscordId('');

            expect(user).toEqual(mockBotUser);

            expect(user).toMatchObject({
                discordId: mockBotUser.discordId,
            });

            expect(mockBotUserModel.findOne).toHaveBeenCalledTimes(1);
            mockBotUserModel.findOne.mockReset();
        });

        it('should throw an exception when does not find a user', () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(false);

            const user = userController.getUserByDiscordId('');

            expect(user).rejects.toBeInstanceOf(NotFoundException);
            expect(mockBotUserModel.findOne).toHaveBeenCalledTimes(1);
            mockBotUserModel.findOne.mockReset();
        });
    });

    describe('tryGetInventoryItem', () => {
        it('should return an InventoryItem when it finds an item', async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(mockBotUser);

            const user = await userController.getUserByDiscordId('');

            const getItemByUserInventory =
                await userController.tryGetInventoryItem({
                    user: user,
                    itemId: 'ticket_2',
                });

            expect(getItemByUserInventory).toMatchObject(user.inventory[0]);
            mockBotUserModel.findOne.mockReset();
        });

        it('should throw an exception when does not find a item', async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(mockBotUser);

            const user = await userController.getUserByDiscordId('');

            const getItemByUserInventory = userController.tryGetInventoryItem({
                user: user,
                itemId: '',
            });

            await expect(getItemByUserInventory).rejects.toThrow(
                "Item with that Id in user's inventory not found"
            );
            await expect(getItemByUserInventory).rejects.toBeInstanceOf(
                NotFoundException
            );
            mockBotUserModel.findOne.mockReset();
        });
    });

    describe('createUser', () => {
        it('should be possible to create user', async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(false);
            mockBotUserModel.create.mockReturnValue(true);

            const createUser = await userController.createUser({
                discordId: '',
                discordName: '',
            });

            expect(createUser).toBeUndefined();
            expect(mockBotUserModel.create).toBeCalledTimes(1);

            mockBotUserModel.findOne.mockReset();
            mockBotUserModel.create.mockReset();
        });
    });

    describe('tryUserPayment', () => {
        it('should be possible to make a payment', async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(mockBotUser);

            const user = await userController.getUserByDiscordId('');

            const userPayment = await userController.tryUserPayment({
                user: user,
                coins: 1,
            });

            expect(userPayment).toBeUndefined();
            expect(mockBotUser.save).toBeCalledTimes(1);

            mockBotUserModel.findOne.mockReset();
        });

        it("should throw an exception when the user doesn't have the required coins", async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(mockBotUser);

            const user = await userController.getUserByDiscordId('');

            const userPayment = userController.tryUserPayment({
                user: user,
                coins: 2,
            });

            expect(userPayment).rejects.toThrow(
                'Coins needed for payment not found'
            );

            mockBotUserModel.findOne.mockReset();
        });
    });

    describe('giveInventoryItem', () => {
        it("should be able to give the item to user and create in inventory if it doesn't exist", async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(mockBotUser);

            const user = await userController.getUserByDiscordId('');

            const giveItem = await userController.giveInventoryItem({
                user: user,
                itemId: 'ticket',
            });

            expect(giveItem).toBeUndefined();
        });

        it('should be able to give the item to the user and increase the quantity if it exists', async () => {
            const userController = buildUserController();

            mockBotUserModel.findOne.mockReturnValue(mockBotUser);

            const user = await userController.getUserByDiscordId('');
            const userInventory = user.inventory[0];

            const giveItem = await userController.giveInventoryItem({
                user: user,
                itemId: userInventory.itemId,
            });

            expect(giveItem).toBeUndefined();
        });
    });

    afterAll((done) => {
        done();
    });
});

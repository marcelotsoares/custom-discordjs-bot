import { CustomBotClient } from '../classes/custom-bot-client.class';
import { NotFoundException } from '../classes/errors';
import { LevelController } from '../controllers/level.controller';
import { UserModel } from '../interfaces/user';
import { mockBotUser } from '../models/__mocks__/bot-user.mock';

jest.mock('../classes/custom-bot-client.class');

const buildLevelController = () => {
    const CustomBotClientMock = CustomBotClient as jest.Mock<CustomBotClient>;
    const customBotClientMocked = new CustomBotClientMock() as jest.Mocked<CustomBotClient>;

    const levelController = new LevelController({
        customBotClient: customBotClientMocked,
    });

    return {
        levelController,
    };
};

describe('levelController', () => {
    describe('generateExpBasedOnRoleByMessageLength', () => {
        it('should be able to call and return a generated exp', async () => {
            const { levelController } = buildLevelController();
            const message = 'Hello, World!';
            const generatedExp = await levelController.generateExpBasedOnRoleByMessageLength(message.length);

            expect(generatedExp).toBeGreaterThanOrEqual(0);
        });

        it('should throw an exception when it does not have a required message length', async () => {
            const { levelController } = buildLevelController();
            const message = '';
            const generatedExp = levelController.generateExpBasedOnRoleByMessageLength(message.length);

            await expect(generatedExp).rejects.toThrow('required message length');
            await expect(generatedExp).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('giveExpToUserByMessage', () => {
        it('should be able give exp to user', async () => {
            const { levelController } = buildLevelController();

            const user = mockBotUser as unknown as UserModel;
            const message = 'Hello, World!';
            const giveExpToUser = await levelController.giveExpToUserByMessage({
                user: user,
                messageLength: message.length,
            });

            expect(giveExpToUser).toBeUndefined();
        });

        it('should be possible to pass the level', async () => {
            const { levelController } = buildLevelController();

            const user = mockBotUser as unknown as UserModel;
            user.xp = 5000;

            const message = 'Hello, World!';
            const giveExpToUser = await levelController.giveExpToUserByMessage({
                user: user,
                messageLength: message.length,
            });

            expect(giveExpToUser).toBeUndefined();
        });

        it('should be able to throw an error if it has', async () => {
            const { levelController } = buildLevelController();

            const user = mockBotUser as unknown as UserModel;
            user.xp = 5000;

            const message = '';
            const giveExpToUser = levelController.giveExpToUserByMessage({
                user: user,
                messageLength: message.length,
            });

            await expect(giveExpToUser).rejects.toThrow('required message length not found');
        });
    });
});

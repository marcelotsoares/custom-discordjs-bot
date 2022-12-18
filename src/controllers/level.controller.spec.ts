import { CustomBotClient } from "../classes/custom-bot-client.class"
import { NotFoundException } from "../classes/errors"
import { LevelController } from "../controllers/level.controller"
import { UserModel } from "../interfaces/user"
import { mockBotUser } from "../models/__mocks__/bot-user.mock"

const buildLevelController = () => {
    const mockCustomBotClient = {
        userController: {
            getUserByDiscordId: jest.fn()
        }
    };

    const levelController = new LevelController({
        customBotClient: (mockCustomBotClient as  unknown) as CustomBotClient
    });

    return {
        mockCustomBotClient,
        levelController
    };
};

describe('levelController', () => {
    describe('generateExpBasedOnRoleByMessageLength', () => {
        it('should be able to call and return a generated exp', async () => {
            const {levelController} = buildLevelController()
            const message = 'Hello, World!'
            const generatedExp = await levelController.generateExpBasedOnRoleByMessageLength(message.length)
            
            expect(generatedExp).toBeGreaterThanOrEqual(0)
        });
        
        it('should throw an exception when it does not have a required message length', async () => {
            const {levelController} = buildLevelController()
            const message = ''
            const generatedExp = levelController.generateExpBasedOnRoleByMessageLength(message.length)

            await expect(
                generatedExp
            ).rejects.toThrow('required message length')
            await expect(generatedExp).rejects.toBeInstanceOf(NotFoundException)
        });
    });

    describe('giveExpToUserByMessage', () => {
        it('should be able give exp to user', async () => {
            const {levelController} = buildLevelController()
            const message = 'Hello, World!'

            const user = (mockBotUser as unknown) as UserModel
            const giveExpToUser = await levelController.giveExpToUserByMessage({
                user: user,
                messageLength: message.length
            });

            expect(giveExpToUser).toBeUndefined();
        });
        
        it('should be possible to pass the level', async () => {
            const {levelController} = buildLevelController()
            const message = 'Hello, World!'

            const user = (mockBotUser as unknown) as UserModel
            user.xp = 5000
            
            const giveExpToUser = await levelController.giveExpToUserByMessage({
                user: user,
                messageLength: message.length
            });

            expect(giveExpToUser).toBeUndefined();
        });

        it('should be able to throw an error if it has', async () => {
            const {levelController} = buildLevelController()
            const message = ''

            const user = (mockBotUser as unknown) as UserModel
            user.xp = 5000

            const giveExpToUser = levelController.giveExpToUserByMessage({
                user: user,
                messageLength: message.length
            });

            await expect(giveExpToUser).rejects.toThrow('required message length not found');
        });
    });
});
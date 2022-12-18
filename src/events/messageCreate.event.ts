/**
 * O Evento message é emitido toda vez que o bot recebe uma mensagem.
 * Podemos usar este evento como uma espécie de middleware para impedir vulnarabilidades ou outras coisas.
 */

import {EventDef} from "../interfaces/events";

export const event: EventDef = {
    name: 'messageCreate',
    executeOnce: false,
    handler: async (client, message) => {
        const users = client.botUsers;
        const userController = client.userController;
        const lvlController = client.levelController;
        const intervalTimeEarnExpInMilliseconds = 60000; // 1 Minute
        
        if (message.author.bot) return;

        const {id: discordId, username: discordName} = message.author;
        
        const executeControllerFunc = async () => {
            const user = await userController.getUserByDiscordId(discordId)
            if(!user) {
                await userController.createUser({discordId, discordName});
            }

            await lvlController.giveExpToUserByMessage({
                user: user,
                messageLength: message.content.length
            });
        }
        
        const executeCommands = async (commandName: string, timeToUseCommand: number) => {
            const user = users.get(discordId);

            if(!user) {
                users.set(discordId, {
                    commands: [{
                        commandName: commandName,
                        lastTimeCommandWasExec: new Date().getTime() + timeToUseCommand
                    }]
                });
                return true
            };

            const commandExist = user.commands.find(props => props.commandName === commandName);
            if(!commandExist) {
                user.commands.push({
                    commandName: commandName,
                    lastTimeCommandWasExec: new Date().getTime() + timeToUseCommand
                })
                return true
            } else if(new Date().getTime() >= commandExist.lastTimeCommandWasExec) {
                commandExist.lastTimeCommandWasExec = new Date().getTime() + timeToUseCommand
                return true
            }

            return false
        }

        if (message.content) {
            const execCommand = await executeCommands('messageCreate', intervalTimeEarnExpInMilliseconds);
            if(execCommand) {
                await executeControllerFunc();
            };
        };

        await userController.createUser({discordId, discordName});
    }
};
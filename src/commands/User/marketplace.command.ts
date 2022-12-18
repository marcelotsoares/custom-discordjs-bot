import {Marketplace} from '../../classes/marketplace.class'
import {Client, BaseCommandInteraction} from "discord.js";
import {CommandDef} from "../../interfaces/command";
import {SlashCommandBuilder} from '@discordjs/builders';
import { CustomBotClient } from '../../classes/custom-bot-client.class';

export const command: CommandDef = {
    usage: {
        commandName: 'marketplace', // It has to be equal to the setName of the data
        timeToUseCommandInMilliseconds: 60000,
        channelId: ['1016030543164489741'],
        channelRequired: true
    },
    data: new SlashCommandBuilder()
        .setName('marketplace')
        .setDescription('Here will the description that will appear in the command.'),
    run: async (customBotClient: CustomBotClient, interaction: BaseCommandInteraction) => {
        try {
            console.log(`interaction: `, interaction);
            const discordClient = customBotClient.discordClient
            const discordId = interaction.user.id;
            console.log(`[Command:marketplace] Command used by discordId: ${discordId}`);
            const commandName = command.usage.commandName;
            const user = discordClient.botUsers.get(discordId);
            console.log(user)

            if(user) {
                const userCommand = user.commands.find(props => props.commandName === commandName);
                console.log(`[Command:marketplace] userCommand: ${JSON.stringify(userCommand)}`);
                if(userCommand) {
                    const date = new Date();
                    const cooldownSeconds = Math.abs((date.getTime() - userCommand.lastTimeCommandWasExec) / 1000);
                    const cooldownMinutes = Math.floor(cooldownSeconds / 60);
                    if(date.getTime() < userCommand.lastTimeCommandWasExec) {
                        await interaction.reply({
                            content: `You need to wait **${cooldownMinutes} minute(s) and ${cooldownSeconds.toFixed(2)} seconds** to use this command again!`,
                            ephemeral: true,
                        })
                        return
                    };
                };
            }

            console.log(`[Command:marketplace] Command executed successfully by discordId: ${discordId}`)

            discordClient.botUsers.set(discordId, {
                commands: [{
                    commandName: commandName,
                    lastTimeCommandWasExec: new Date().getTime() + command.usage.timeToUseCommandInMilliseconds
                }]
            });

            const marketplace = new Marketplace(customBotClient, interaction)

            const {embed, rowSelectMenu} = await marketplace.createMarketplaceMenu()

            if(rowSelectMenu) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [embed],
                    components: [rowSelectMenu]
                })
            };
        } catch (error) {
            if(error instanceof Error) {
                console.log(`[marketplace:commands] Error - ${error.message}`);
            };
        };
    }
};
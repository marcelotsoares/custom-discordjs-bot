import { Marketplace } from '../../classes/marketplace.class';
import { BaseCommandInteraction } from 'discord.js';
import { CommandDef } from '../../interfaces/command';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CustomBotClient } from '../../classes/custom-bot-client.class';

export const command: CommandDef = {
    usage: {
        commandName: 'marketplace', // It has to be equal to the setName of the data
        timeToUseCommandInMilliseconds: 60000,
        channelId: ['1051251849551937636', '1054800763320291449'],
        channelRequired: true,
    },
    data: new SlashCommandBuilder()
        .setName('marketplace')
        .setDescription('Here will the description that will appear in the command.'),
    run: async (customBotClient: CustomBotClient, interaction: BaseCommandInteraction) => {
        try {
            const discordId = interaction.user.id;
            console.log(`[Command:marketplace] Command used by discordId: ${discordId}`);

            const marketplace = new Marketplace(customBotClient, interaction);

            const { embed, rowSelectMenu } = await marketplace.createMarketplaceMenu();

            if (rowSelectMenu) {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [embed],
                    components: [rowSelectMenu],
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log(`[marketplace:commands] Error - ${error.message}`);
            }
        }
    },
};

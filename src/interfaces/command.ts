import { BaseCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CustomBotClient } from '../classes/custom-bot-client.class';

export interface CommandDef {
    usage: {
        commandName: string;
        timeToUseCommandInMilliseconds: number;
        channelRequired?: boolean;
        channelId?: string[];
        aliases?: string[];
        roleRequired?: boolean;
        roleName?: string;
    };
    data: SlashCommandBuilder;
    run: (customBotClient: CustomBotClient, interaction: BaseCommandInteraction) => Promise<void>;
}

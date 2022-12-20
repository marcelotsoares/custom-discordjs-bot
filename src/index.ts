import 'dotenv/config';

import process from 'node:process';

import { LevelController } from './controllers/level.controller.js';
import { Client as DiscordClient, Intents } from 'discord.js';
import { UserController } from './controllers/user.controller.js';

// main bot class
import { CustomBotClient } from './classes/custom-bot-client.class.js';
import { databaseConfig } from './config/database.config.js';

import { connect } from 'mongoose';
import { MongoDbConfig, DualEnv } from './interfaces/configs.js';
import { MarketplaceController } from './controllers/marketplace.controller.js';
import { BotUserModel } from './models/bot-user';
import { NotFoundException } from './classes/errors.js';
import { CommandDef } from 'interfaces/command.js';

const discordClientOptions = {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
};

let NODE_ENV = 'dev';
if (process.env.NODE_ENV === 'prod') {
    NODE_ENV = 'prod';
}

const main = async () => {
    if (!process.env.TOKEN) {
        throw new NotFoundException('The token');
    }

    if (!process.env.GUILD_ID) {
        throw new NotFoundException('Guild_ID');
    }

    if (!process.env.APPLICATION_ID) {
        throw new NotFoundException('Application_ID');
    }

    const dbConfig = databaseConfig[NODE_ENV as keyof DualEnv<any>] as MongoDbConfig;

    // mongodb
    await connect(dbConfig.uri, {
        dbName: 'customBot',
    });

    const client = new DiscordClient(discordClientOptions);

    const customBotClient = new CustomBotClient({
        discordClient: client,
    });

    try {
        const userController = new UserController({
            customBotClient: customBotClient,
            botUserModel: BotUserModel,
        });

        customBotClient.userController = userController;
        client.userController = userController;

        const levelController = new LevelController({
            customBotClient: customBotClient,
        });
        customBotClient.levelController = levelController;
        client.levelController = levelController;

        const marketplaceController = new MarketplaceController({
            customBotClient: customBotClient,
        });

        customBotClient.marketplaceController = marketplaceController;
        client.marketplaceController = marketplaceController;
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            console.log('Failed to load controllers!');
            process.exit(1);
        }
    }

    try {
        await customBotClient.loadCommands('commands');
        await customBotClient.loadSlashCommands(process.env.APPLICATION_ID, process.env.GUILD_ID);
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Failed to load commands - ${error.message}`);
            console.error(error);
            process.exit(1);
        }
    }

    try {
        await customBotClient.loadEvents('events');
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Failed to load events - ${error.message}`);
            console.log(error);
            process.exit(1);
        }
    }

    client.on('ready', async () => {
        console.log(`Logged in as ${client.user?.tag}!`);
    });

    client.on('interactionCreate', async (interaction) => {
        const userByInteraction = interaction.user;
        const userId = userByInteraction.id;
        const discordClient = customBotClient.discordClient;
        if (interaction.isCommand()) {
            const commandName = interaction.commandName;
            const guild = interaction.guild;
            const discordId = interaction.user.id;

            if (guild == null) {
                throw new NotFoundException('Interaction guild');
            }

            const { id, name } = guild;
            const data = {
                discordName: `${userByInteraction.username}#${userByInteraction.discriminator}`,
                guildName: name,
                command: commandName,
                guildId: id,
                discordId: userId,
            };
            console.log(id);
            console.log(`[index:interactionCreate] ${JSON.stringify(data)}`);

            console.log(discordClient.commands?.get(commandName));

            const clientCommands = discordClient.commands;
            if (clientCommands) {
                const command: CommandDef = clientCommands.get(commandName);
                const usage = command.usage;
                if (usage.channelId && usage.channelId.length) {
                    if (!usage.channelId.includes(interaction.channelId)) {
                        let channels = '';
                        usage.channelId.map((id) => {
                            channels += `<#${id}> `;
                        });

                        await interaction.reply(`this command can only be used on the following channels: ${channels}`);

                        return;
                    }
                }

                const user = discordClient.botUsers.get(discordId);
                console.log(user);

                if (user) {
                    const userCommand = user.commands.find((props) => props.commandName === commandName);
                    console.log(`[Command:marketplace] userCommand: ${JSON.stringify(userCommand)}`);
                    if (userCommand) {
                        const date = new Date();
                        const cooldownSeconds = Math.abs((date.getTime() - userCommand.lastTimeCommandWasExec) / 1000);
                        const cooldownMinutes = Math.floor(cooldownSeconds / 60);
                        if (date.getTime() < userCommand.lastTimeCommandWasExec) {
                            await interaction.reply({
                                content: `Command cooldown **${cooldownMinutes} minute(s) and ${cooldownSeconds.toFixed(
                                    2
                                )} seconds**`,
                                ephemeral: true,
                            });
                            return;
                        }
                    }
                }

                console.log(`[Command:marketplace] Command executed successfully by discordId: ${discordId}`);

                discordClient.botUsers.set(discordId, {
                    commands: [
                        {
                            commandName: commandName,
                            lastTimeCommandWasExec: new Date().getTime() + command.usage.timeToUseCommandInMilliseconds,
                        },
                    ],
                });

                await command.run(customBotClient, interaction);
            }
        }

        if (interaction.isSelectMenu()) {
            const interactionId = interaction.customId;

            if (interactionId == 'Marketplace_Menu') {
                try {
                    const itemId = interaction.values[0];
                    const discordId = userByInteraction.id;

                    const userController = customBotClient.userController;
                    const user = await userController.getUserByDiscordId(discordId);

                    const marketplaceController = customBotClient.marketplaceController;

                    const itemConfig = await marketplaceController.getItemById({
                        itemId,
                    });

                    await marketplaceController.tryToBuyItemOnMarketplace({
                        user: user,
                        itemId: itemId,
                        price: itemConfig.price,
                    });

                    await interaction.reply('Item comprado com sucessso!');

                    await customBotClient.delay(5000);

                    await interaction.deleteReply();
                } catch (error) {
                    if (error instanceof Error) {
                        await interaction.reply(error.message);
                        await customBotClient.delay(5000);
                        await interaction.deleteReply();
                    }
                }
            }
        }
    });

    await client.login(process.env.TOKEN);
};

main().catch();

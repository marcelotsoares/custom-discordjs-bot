import 'dotenv/config'

import process from 'node:process'

import {Client as DiscordClient, Intents} from 'discord.js'

import {LevelController} from './controllers/level.controller.js'
import {UserController} from './controllers/user.controller.js'

// main bot class
import {CustomBotClient} from "./classes/custom-bot-client.class.js";
import {databaseConfig} from "./config/database.config.js";

import mongoosePkg from "mongoose";
import {MongoDbConfig, DualEnv} from "./interfaces/configs.js";
import {MarketplaceController} from './controllers/marketplace.controller.js'

const {connect, Types} = mongoosePkg;

const discordClientOptions = {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
};

let NODE_ENV: string = 'dev';
if (process.env.NODE_ENV === 'prod') {
    NODE_ENV = 'prod';
};

if(!process.env.TOKEN) {
    throw new Error("[index:error] The token must be provided")
}

const main = async () => {

    const dbConfig = databaseConfig[NODE_ENV as keyof DualEnv<any>] as MongoDbConfig;

    // mongodb
    await connect(dbConfig.uri, { 
        dbName: 'customBot'
    });

    const client = new DiscordClient(discordClientOptions);

    const customBotClient = new CustomBotClient({
        discordClient: client
    });

    try {
        const levelController = new LevelController();
        levelController.customBotClient = customBotClient;
        customBotClient.levelController = levelController;
        client.levelController = levelController;
        
        const userController = new UserController();
        userController.customBotClient = customBotClient;
        customBotClient.userController = userController;
        client.userController = userController;
        
        const marketplaceController = new MarketplaceController();
        marketplaceController.customBotClient = customBotClient;
        customBotClient.marketplaceController = marketplaceController;
        client.marketplaceController = marketplaceController;

    } catch (error) {
        if(error instanceof Error) {
            console.log(error.message);
            console.log('Failed to load controllers!');
            process.exit(1);
        };
    };

    try {
        await customBotClient.loadCommands('commands');
    } catch (error) {
        if(error instanceof Error) {
            console.log(`Failed to load commands - ${error.message}`);
            console.error(error);
            process.exit(1);
        };
    };

    try {
        await customBotClient.loadEvents('events');
    } catch (error) {
        if(error instanceof Error) {
            console.log(`Failed to load events - ${error.message}`);
            console.log(error);
            process.exit(1);
        };
    };

    client.on('ready', async () => {
        console.log(`Logged in as ${client.user!.tag}!`);

        // TODO: deixei comentado pois a função está com vários erros
        // await client.patreonController.loopToRemovePatreon();
    });

    client.on('interactionCreate', async (interaction) => {
        const user = interaction.user
        const userId = user.id
        
        if(interaction.isCommand()) {
            const commandName = interaction.commandName
            const data = {
                discordName: `${user.username}#${user.discriminator}`, 
                guildName: interaction.guild!.name,
                command: commandName,
                guildId: interaction.guild!.id,
                discordId: userId
            };
            console.log(interaction.guild!.id);
            console.log(`[index:interactionCreate] ${JSON.stringify(data)}`);

            console.log(customBotClient.discordClient.commands!.get(commandName));

            const command = customBotClient.discordClient.commands!.get(commandName);

            await command.run(customBotClient, interaction);
        };

        if(interaction.isSelectMenu()) {
            const interactionId = interaction.customId
            
            if(interactionId == 'Marketplace_Menu') {
                const user = interaction.user
                const itemId = interaction.values[0]
                const discordId = user.id

                const tryBuyItem = await customBotClient.marketplaceController.tryToBuyItemOnMarketplace({
                    discordId: discordId,
                    itemId: itemId
                })

                await interaction.reply(tryBuyItem.message);

                await customBotClient.delay(5000);

                await interaction.deleteReply();

                if(tryBuyItem.error) {
                    console.log(`[tryBuyItem:error] userId: ${userId} - Message: ${tryBuyItem.message}`)
                    return
                }

                await customBotClient.userController.giveInventoryItem({
                    discordId: discordId,
                    itemId: itemId
                })


            }   
        };
    });

    await client.login(process.env.TOKEN);
};

main().catch();


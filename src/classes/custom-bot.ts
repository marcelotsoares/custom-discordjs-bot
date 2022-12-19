import { Client, Collection } from 'discord.js';
import { readdir, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { CommandDef } from '../interfaces/command';
import { EventDef } from '../interfaces/events';
import { LevelController } from '../controllers/level.controller';
import { UserController } from '../controllers/user.controller';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { readdirSync } from 'node:fs';
import { MarketplaceController } from '../controllers/marketplace.controller';

export interface ICustomBotOpts {
    discordClient: Client;
}

export class CustomBot {
    discordClient: Client;

    eventModules: EventDef[];
    commandModules: CommandDef[];

    // injected controllers
    levelController: LevelController;
    userController: UserController;
    marketplaceController: MarketplaceController;

    constructor(options: ICustomBotOpts) {
        this.eventModules = [];
        this.commandModules = [];

        this.discordClient = options.discordClient;
        this.discordClient.botUsers = new Map();
    }

    async loadEvents(path: string) {
        try {
            const eventFiles = await readdirSync(join('dist', path)).filter((file) => file.endsWith('.event.js'));
            console.log(`[classes:custom-bot:loadEvents] carregando eventos...`);
            for (const file of eventFiles) {
                const eventPath = join('..', path, file).replace('\\', '/');
                const eventModule = (await import(eventPath)).event as EventDef;
                if (eventModule) {
                    this.eventModules.push(eventModule);
                    try {
                        if (eventModule.executeOnce) {
                            this.discordClient.once(eventModule.name, eventModule.handler.bind(null, this.discordClient));
                        } else {
                            this.discordClient.on(eventModule.name, eventModule.handler.bind(null, this.discordClient));
                        }
                    } catch (error) {
                        console.log(`[classes:custom-bot:loadEvents] Não foi possível carregar o evento ${eventModule.name} : ${error}`);
                    }
                }
            }
            console.log(`[classes:custom-bot:loadEvents] Loaded events: ${this.eventModules.length}`);
        } catch (error) {
            console.log(error);
        }
    }

    async loadCommands(path: string) {
        console.log(`[classes:custom-bot:loadCommands] path: ${path}`);
        if (!this.discordClient.commands) {
            this.discordClient.commands = new Collection();
        }

        const commandFolders = await readdir(join('dist', path));
        console.log(`[classes:custom-bot:loadCommands] carregando comandos...`);
        console.log(`[classes:custom-bot:loadCommands] commandFolders: ${commandFolders}`);

        for (const folder of commandFolders) {
            console.log(`[classes:custom-bot:loadCommands] folder: ${folder}`);
            const targetDirectoryPath = join('dist', path, folder);
            console.log(`[classes:custom-bot:loadCommands] targetDirectoryPath: ${targetDirectoryPath}`);

            if ((await lstat(targetDirectoryPath)).isDirectory()) {
                const directoryCommands = await readdir(targetDirectoryPath);
                console.log(`[classes:custom-bot:loadCommands] directoryCommands: ${directoryCommands}`);
                const moduleFolderPath = join('..', path, folder).replace('\\', '/');
                console.log(`[classes:custom-bot:loadCommands] moduleFolderPath: ${moduleFolderPath}, folder: ${folder}`);
                for (const commandFolder of directoryCommands) {
                    console.log(`commandFolder: ${commandFolder}`);
                    if (commandFolder.endsWith('.command.js')) {
                        const module = join(moduleFolderPath, commandFolder).replace('\\', '/');
                        console.log(`[classes:custom-bot:loadCommands] Importing module from ${module}`);

                        const commandModule = (await import(module)).command as CommandDef;
                        console.log(`[classes:custom-bot:loadCommands] CommandModule: ${JSON.stringify(commandModule)}, command Id: ${commandModule.usage.commandName}`);

                        this.commandModules.push(commandModule);
                        this.discordClient.commands.set(commandModule.usage.commandName, commandModule);
                    }
                }
            }
        }
    }

    async loadSlashCommands(applicationId: string, guildId: string) {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || '');

        try {
            const commandData = this.discordClient.commands?.map((commandInfo) => {
                console.log('commandInfo', commandInfo);
                return commandInfo.data.toJSON();
            });
            console.log('commandData: ', commandData);
            console.log('[classes:custom-bot:loadSlashCommands] Started refreshing application (/) commands.');

            rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
                body: commandData,
            })
                .then(() => {
                    console.log('[classes:custom-bot:loadSlashCommands] Successfully reloaded application (/) commands.');
                })
                .catch((error) => {
                    console.log(`[classes:custom-bot:loadSlashCommands] Error load commands. ${error}`);
                });
        } catch (error) {
            console.log(error);
        }

        console.log(`[classes:custom-bot:loadSlashCommands] SlashCommands carregados: ${this.commandModules.length}`);
    }

    delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

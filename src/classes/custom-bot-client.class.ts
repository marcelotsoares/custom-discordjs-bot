import { Client, MessageEmbed, Message } from 'discord.js';
import { CustomBot, ICustomBotOpts } from './custom-bot';

interface ICreateChannel {
    client: Client;
    message: Message;
    parentId: string;
    channelId: string;
}

interface IGuildObject {
    name: string;
    id: string;
    icon: string;
}

interface ICreateEmbed {
    title: string;
    description: string;
    guild: IGuildObject;
}

export class CustomBotClient extends CustomBot {
    constructor(options: ICustomBotOpts) {
        super(options);
    }

    async createChannel(props: ICreateChannel) {
        try {
            const { client, channelId, message, parentId } = props;
            if (!message) {
                return console.log('[createChannel] Message not found');
            }

            if (!message.guild) {
                return console.log('[createChannel] MessageGuild not found');
            }

            if (!client.user) {
                return console.log('[createChannel] ClientUser not found');
            }

            return await message.guild.channels.create(`${channelId}-${message.author.id}`, {
                parent: parentId,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone,
                        deny: 'VIEW_CHANNEL',
                    },
                    {
                        id: client.user,
                        allow: 'VIEW_CHANNEL',
                    },
                    {
                        id: message.author,
                        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                    },
                ],
            });
        } catch (err) {
            console.log('[createChannel:error]', err);
        }
    }

    async addRoleToUser(message: Message, roleName: string) {
        if (!message) {
            return console.log('[addRoleToUser] Message not found');
        }

        if (!message.guild) {
            return console.log('[addRoleToUser] MessageGuild not found');
        }

        if (!message.member) {
            return console.log('[addRoleToUser] MessageMember not found');
        }

        console.log(`[addRoleToUser] roleName: ${roleName}`);
        const role = message.guild.roles.cache.find((role) => role.name === roleName);
        if (role) {
            message.member.roles.add(role);
        }
    }

    async userHasRole(message: Message, roleName: string) {
        if (!message) {
            return console.log('[userHasRole] Message not found');
        }

        if (!message.guild) {
            return console.log('[userHasRole] MessageGuild not found');
        }

        if (!message.member) {
            return console.log('[userHasRole] MessageMember not found');
        }

        const role = message.guild.roles.cache.find((role) => role.name === roleName);
        if (role) {
            if (message.member.roles.cache.has(role.id)) {
                return true;
            }
        }
        return false;
    }

    async createEmbed({ title, description, guild }: ICreateEmbed) {
        return new MessageEmbed()
            .setTitle(title)
            .setColor('DARK_PURPLE')
            .setDescription(String(description))
            .setTimestamp()
            .setThumbnail(`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`)
            .setFooter({
                text: guild.name,
                iconURL: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`,
            });
    }
}

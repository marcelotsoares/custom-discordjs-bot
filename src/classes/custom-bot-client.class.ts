import { MessageEmbed } from 'discord.js';
import { CustomBot, ICustomBotOpts } from './custom-bot';

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

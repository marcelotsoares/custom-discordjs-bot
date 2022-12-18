import { MarketplaceConfig } from '../config/marketplace.config';
import { BaseCommandInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';
import { CustomBotClient } from './custom-bot-client.class';
import { ICreateMenuMarketplace } from 'interfaces/marketplace';

export class Marketplace {
    interaction: BaseCommandInteraction;
    customBotClient: CustomBotClient;

    constructor(customBotClient: CustomBotClient, interaction: BaseCommandInteraction) {
        this.customBotClient = customBotClient;
        this.interaction = interaction;
    }

    async buildSelectMenuMarketplace() {
        const row = new MessageActionRow();

        const dataOptions = [];

        for (const data of MarketplaceConfig.items) {
            dataOptions.push({
                label: `${data.itemName} - Price: ${data.price} Coins`,
                description: data.description,
                value: data.itemId,
            });
        }

        const selectMenu = new MessageSelectMenu().setCustomId('Marketplace_Menu').setPlaceholder('Nothing selected').addOptions(dataOptions);

        row.addComponents(selectMenu);

        return row;
    }

    async createMarketplaceMenu(): Promise<ICreateMenuMarketplace> {
        const rowSelectMenu = await this.buildSelectMenuMarketplace();

        const embedMarketplace = await this.customBotClient.createEmbed({
            title: 'Marketplace',
            description: `
                Bem-vindo ao Marketplace do **CustomBot**

                *- Para comprar um item basta selecionar ao menu abaixo qual você deseja*

                *- Caso deseja saber quantas **Coins** você tem use o comando \`/perfil\`*
            `,
            guild: {
                name: this.interaction.guild?.name ?? 'Guild name not found',
                id: this.interaction.guild?.id ?? 'Guild id not found',
                icon: this.interaction.guild?.icon ?? 'Guild icon not found',
            },
        });

        return {
            embed: embedMarketplace,
            rowSelectMenu: rowSelectMenu,
        };
    }
}

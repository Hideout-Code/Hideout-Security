import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { panelAPI } from '@handlers/panel';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart the Bot'),

        async execute(interaction: ChatInputCommandInteraction) {
            await interaction.reply({content: 'Restarting...',ephemeral: true });
            await panelAPI('power', '9ac186c3', 'restart');
        }
};
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge Messages'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply({ content: 'Currently under development!'});
	},
};
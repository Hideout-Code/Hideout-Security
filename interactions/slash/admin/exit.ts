import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('crash')
		.setDescription('Shuts the Bot Down!'),
	async execute(interaction: ChatInputCommandInteraction) {
       
     const crash = new ButtonBuilder()
        .setCustomId('crash')
        .setLabel('Crash')
        .setStyle(ButtonStyle.Danger);

    const crashn = new ButtonBuilder()
        .setCustomId('crashn')
        .setLabel('Dont Crash')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(crash, crashn)

		await interaction.reply({components: [row]});
  },
};
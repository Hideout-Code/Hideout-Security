import { Interaction } from "discord.js";
import { CustomClient } from "..";
import { errLog, intLog } from '@handlers/logger.ts';

module.exports = {
	name: "interactionCreate",

	async execute(interaction: Interaction) {
		// Deconstructed client from interaction object.
		const client = interaction.client as CustomClient;

		// Checks if the interaction is a command (to prevent weird bugs)

		if (!interaction.isChatInputCommand()) return;
		const command = client.slashCommands.get(interaction.commandName);

		// If the interaction is not a command in cache.

		if (!command) return;
		
		try {
			intLog(interaction);
			await command.execute(interaction);
		} catch (err: any) {
			errLog(client, err);
			await interaction.reply({
				content: "There was an issue while executing that command!",
				ephemeral: true,
			});
		}
	}
};
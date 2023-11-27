import { ButtonInteraction } from "discord.js";

module.exports = {
    id: "crash",

    async execute(interaction: ButtonInteraction) {
    await interaction.reply({ content: "Crashing Please Wait..."})
    process.exit(0)
    }
}
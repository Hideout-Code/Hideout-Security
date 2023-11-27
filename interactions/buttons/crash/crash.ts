import { ButtonInteraction } from "discord.js";

module.exports = {
    id: "crash",

    async execute(interaction: ButtonInteraction) {
    await interaction.reply({ content: "Crashing Please Wait..."})
    process.env.LOGLEVEL
    process.exit(0)
    }
}
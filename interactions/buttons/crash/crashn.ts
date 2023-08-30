import { ButtonInteraction } from "discord.js";

module.exports = {
    id: "crashn",

    async execute(interaction: ButtonInteraction) {
        interaction.reply({ content: "Crash Canceled!"})
    }
}
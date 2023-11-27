import { ButtonInteraction } from "discord.js";
import { errLog } from "../../../handlers/logger";

module.exports = {
    id: "crash",

    async execute(interaction: ButtonInteraction) {
    await interaction.reply({ content: "Crashing Please Wait..."})
    errLog
    process.exit(0)
    }
}
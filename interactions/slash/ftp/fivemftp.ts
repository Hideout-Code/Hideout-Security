import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fivemftp')
		.setDescription('Login For The FiveM FTP'),


        async execute(interaction: ChatInputCommandInteraction) {
            await interaction.deferReply()
            let username = 'Administrator'
            let password = 'test'
            const bEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('FiveM FTP Login')
             .addFields(
                { name: 'Username', value: username },
                { name: 'Password', value: password },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
             )
            // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setTimestamp()
            .setFooter({ text: 'Login'});
		
			
		await interaction.editReply({embeds: [bEmbed]});
	},
};
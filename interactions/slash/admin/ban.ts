import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";
import { banDB } from "@handlers/db";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans A User')
		.addUserOption(user => user
			.setName('user')
			.setDescription('User That Is Getting Banned')
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('reason')
			.setDescription('Reason For The Ban')
			.setRequired(true)
		),
        async execute(interaction: ChatInputCommandInteraction) {
            await interaction.deferReply()
            let target = interaction.options.getUser("user") as User
            let reason = interaction.options.getString("reason") as string
            const banEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Ban Added')
            .setDescription(`<@${target.id}> Has Been Banned`)
             .addFields(
                { name: 'User Id', value: `${target.id}` },
                { name: 'Ban Reason', value: reason },
                { name: 'Responsible Admin For Ban', value: `<@${interaction.user.id}>` },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
             )
            // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setTimestamp()
            .setFooter({ text: 'User Banned'});
		await interaction.guild?.bans.create(target, {deleteMessageSeconds: 604800 , reason: reason});
        await banDB.create({
            user: target!.id,
            reason: reason,
            staff: interaction.user.id,
        });
			
		await interaction.editReply({embeds: [banEmbed]});
	},
};
import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import log from '@handlers/logger.ts';
import { CustomClient } from "..";

module.exports = {
	name: "guildMemberRemove",
	once: false,

    async execute(member: GuildMember, client: CustomClient) {
        // Make the event guild specific
        if (member.guild.id !== process.env.TEST_GUILD_ID) return;

        // Logger
        const left = new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle(`${member.user.username} - User Left`)
            .setDescription(`<@${member.user.id}>`)
            .addFields(
                { name: `Account age`, value: `<t:${member.user.createdTimestamp.toString().substring(0, member.user.createdTimestamp.toString().length - 3)}:R>`, inline: true },
                { name: `Joined`, value: `<t:${member.joinedTimestamp!.toString().substring(0, member.joinedTimestamp!.toString().length - 3)}:R>`, inline: true },
            )
            .setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=1024`)
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.user.id}` });

        // Log the leave
        await (client.channels.cache.get(process.env.INVITE_LOGS!) as TextChannel).send({ embeds: [left] });
        log.info(`${member.user.username} | User Left`);
    },
};
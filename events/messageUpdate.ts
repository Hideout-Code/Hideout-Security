import { EmbedBuilder, Message, TextChannel } from "discord.js";
import log from '@handlers/logger.ts';
import { MessageDB } from '@handlers/db.ts';
import { CustomClient } from "..";

const regex = /https?:\/\/[^\s]+/g;

module.exports = {
	name: "messageUpdate",

	async execute(oldMessage: Message, newMessage: Message, client: CustomClient) {
        // Make the event guild specific
        if (newMessage.guildId !== process.env.TEST_GUILD_ID) return;
        // If message is a bot, stop
        if (newMessage.author.bot) return;

        // Fetch the old message from the DB

        let oldMessageDB = await MessageDB.findOne({ where: { id: oldMessage.id } });

        // If the message is not in the DB, add it.
        try {
            if (!oldMessageDB) {
                await MessageDB.create({
                    id: newMessage.id,
                    userID: newMessage.author.id,
                    content: newMessage.content,
                    attachments: newMessage.attachments.map((a: { proxyURL: any; }) => a.proxyURL).join("\n"),
                });
                oldMessageDB = await MessageDB.findOne({ where: { id: newMessage.id } });
            };
        } catch (error) {
            log.warn(error);
        };
        

        if (oldMessageDB.content != newMessage.content) { // If the content is different

            // find links
            const oldLinks = oldMessageDB.content.match(regex);
            const newLinks = newMessage.content.match(regex);

            const messageChangeEmbed = new EmbedBuilder()
                .setTitle("Message Updated")
                .setColor("#0099ff")
                .setDescription(`Message edited in <#${newMessage.channelId}> [View Message](https://discordapp.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id})`)
                .setTimestamp()
                .setFooter({ text: `Message ID: ${newMessage.id}` });

            // Update the message in the DB
            await MessageDB.update({ content: newMessage.content }, { where: { id: newMessage.id } });

            if (newMessage.content.length > 1000 || oldMessageDB.content.length > 1000) { // If the message is longer than 1000 characters
                // Send a message to the log channel
                messageChangeEmbed.addFields(
                    { name: "Content", value: 'Message content over character limit. (1024+ characters)', inline: true },
                    { name: "Message Author", value: `<@${newMessage.author.id}>`}
                );
                (client.channels.cache.get(process.env.MESSAGE_LOGS!) as TextChannel).send({ embeds: [messageChangeEmbed] });
            } else {
                // Log the message update
                messageChangeEmbed.addFields(
                    { name: "Old Content", value: '`' + oldMessageDB.content + '`', inline: true },
                    { name: "New Content", value: '`' + newMessage.content + '`', inline: true },
                    { name: "Message Author", value: `<@${newMessage.author.id}>`}
                );
                (client.channels.cache.get(process.env.MESSAGE_LOGS!) as TextChannel).send({ embeds: [messageChangeEmbed] });
            };

            if (oldLinks != newLinks && !newMessage.member!.roles.cache.find((r: { name: string; }) => r.name === "Castle Guard")) {await newMessage.delete(); return;};
        };

        if (oldMessageDB.attachments != newMessage.attachments) { // If the attachments are different
            var attachmentsArray = newMessage.attachments.map((a: { proxyURL: any; }) => a.proxyURL);
			var attachments = attachmentsArray.join(", ");
            // Update the message in the DB
            await MessageDB.update({ attachments: attachments }, { where: { id: newMessage.id } });
        };
        log.info(`Message Updated.`);
        return;
    }
};
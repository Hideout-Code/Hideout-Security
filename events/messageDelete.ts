import { EmbedBuilder, Message, TextChannel } from "discord.js";
import log from '@handlers/logger.ts';
import { MessageDB } from '@handlers/db.ts';
import { CustomClient } from "..";

module.exports = {
	name: "messageDelete",

	async execute(message: Message, client: CustomClient) {
        // Make the event guild specific
        if (message.guildId !== process.env.TEST_GUILD_ID) return;

        const messageToPull = message.id;
        const msgFDB = await MessageDB.findOne({ where: { id: messageToPull } });
        if (msgFDB === null) return;  
        let fullContent = msgFDB.content
        if (fullContent.length >= 1000) {
            fullContent = 'Message over 1024 character limit.'
        }

        // Logger
        const messageDelEmbed = new EmbedBuilder()
            .setTitle("Message Deleted")
            .setColor("#ff0000")
            .setDescription(`<@${msgFDB.userID}>'s message was deleted in <#${message.channelId}>`)
            .setTimestamp()
            .setFooter({ text: `Message ID: ${message.id}` });

        // Check for attachments
        if (msgFDB.attachments === "") {
            // Check for content
            if (msgFDB.content === "") {
                await (client.channels.cache.get(process.env.MESSAGE_LOGS!) as TextChannel).send({ embeds: [messageDelEmbed] });
                log.info(`Message Deleted`);
                return;
            } else {
                messageDelEmbed.addFields({ name: "Content", value: '`' + fullContent + '`', inline: false });

                await (client.channels.cache.get(process.env.MESSAGE_LOGS!) as TextChannel).send({ embeds: [messageDelEmbed] });
                log.info(`Message Deleted`);
                return;
            };
        } else {
            // Check for content
            if (msgFDB.content === "") {
                messageDelEmbed.addFields({ name: "Attachments", value: msgFDB.attachments, inline: false });

                await (client.channels.cache.get(process.env.MESSAGE_LOGS!) as TextChannel).send({ embeds: [messageDelEmbed] });
                log.info(`Message Deleted`);
                return;
            } else {
                messageDelEmbed.addFields(
                        { name: "Content", value: '`' + fullContent + '`', inline: false }, 
                        { name: "Attachments", value: msgFDB.attachments, inline: false });

                await (client.channels.cache.get(process.env.MESSAGE_LOGS!) as TextChannel).send({ embeds: [messageDelEmbed] });      
                log.info(`Message Deleted`);              
                return;
            };
        };
    },
};

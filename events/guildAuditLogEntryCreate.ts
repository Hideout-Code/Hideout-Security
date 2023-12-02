import { Guild, GuildAuditLogsEntry, AuditLogEvent, EmbedBuilder, User, TextChannel } from "discord.js";
import { banDB, inviteDB } from "@handlers/db";
import { log } from "@handlers/logger";

module.exports = {
	name: "guildAuditLogEntryCreate",
	once: false,

    async execute(auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
        if (guild.id !== process.env.TEST_GUILD_ID) return;
        let eventLogsChannel = await guild.channels.cache.get(process.env.EVENT_LOGS!) as TextChannel;
        let roleLogsChannel = await guild.channels.cache.get(process.env.ROLE_LOGS!) as TextChannel;

        let reason: string;
        if (auditLogEntry.reason === null) {
            reason = "No reason provided.";
        } else {
            reason = auditLogEntry.reason;
        };

        let target: User;
        if (auditLogEntry.target instanceof User) {
            target = auditLogEntry.target;
        };

        let doneOnSelf: boolean = false;
        if (auditLogEntry.executorId === auditLogEntry.targetId) {
            doneOnSelf = true;
        };

        switch (auditLogEntry.action) {
            case AuditLogEvent.InviteCreate:
                try {
                    await inviteDB.create({
                        code:  auditLogEntry.changes[0].new as string,
                        authorID : auditLogEntry.executorId as string,
                        uses: 0,
                    });
                } catch {};
            break;

            case AuditLogEvent.InviteDelete:
                await inviteDB.destroy({ where: { code: auditLogEntry.changes[0].old as string }});
            break;

            case AuditLogEvent.MemberBanAdd:
                if (auditLogEntry.executorId === process.env.CLIENT_ID) return;
                
                const banLog = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setDescription(`<@${target!.id}>`)
                    .addFields(
                        { name: `Banned by`, value: `<@${auditLogEntry.executorId}>`, inline: false },
                        { name: `Reason`, value: reason, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: `User ID: ${target!.id}` });

                banLog.setTitle(`User Banned - ${target!.username}`);
                banLog.setThumbnail(`https://cdn.discordapp.com/avatars/${target!.id}/${target!.avatar}.png?size=1024`);

                await eventLogsChannel.send({ embeds: [banLog] });


                if (auditLogEntry.executorId != process.env.CLIENT_ID) {
                    await banDB.create({
                        user: target!.id,
                        reason: reason,
                        staff: auditLogEntry.executorId as string
                    });
                };

                log.info(`${target!.username} | Banned`);               
            break;
            
            case AuditLogEvent.MemberBanRemove:
                const unbanLog = new EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle(`User Unbanned`)
                    .setDescription(`<@${target!.id}>`)
                    .addFields(
                        { name: `Unbanned by`, value: `<@${auditLogEntry.executorId}>`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: `User ID: ${target!.id}` });
                
                await eventLogsChannel.send({ embeds: [unbanLog] });
                log.info(`${target!.username} | Unbanned`);
                await banDB.destroy({ where: { user: target!.id }});
            break;
            
            case AuditLogEvent.MemberRoleUpdate:
                // Sort out what roles are being added and removed
                let addedRoles: string[] = [];
                let removedRoles: string[] = [];
                auditLogEntry.changes.forEach((change) => {
                    if (Array.isArray(change.new) && change.key === "$add") {
                        change.new.forEach((role: any) => {
                            addedRoles.push(`<@&${role.id}>`);
                        });
                    } else if (Array.isArray(change.new) && change.key === "$remove") {
                        change.new.forEach((role: any) => {
                            removedRoles.push(`<@&${role.id}>`);
                        });
                    };
                });

                var roleUpdateLog = new EmbedBuilder()
                    .setColor("#e6c335")
                    .setDescription(`<@${target!.id}>`)
                    .setTimestamp()
                    .setFooter({ text: `User ID: ${target!.id}` });

                if (!doneOnSelf) {
                    roleUpdateLog.addFields({ name: `Updated by`, value: `<@${auditLogEntry.executorId}>`, inline: false });
                };

                roleUpdateLog.setTitle(`Roles Updated - ${target!.username}`);
                roleUpdateLog.setThumbnail(`https://cdn.discordapp.com/avatars/${target!.id}/${target!.avatar}.png?size=1024`);

                if (addedRoles.length > 0) {
                    roleUpdateLog.addFields({ name: `Roles Added`, value: addedRoles.join(", "), inline: false });
                };
                if (removedRoles.length > 0) {
                    roleUpdateLog.addFields({ name: `Roles Removed`, value: removedRoles.join(", "), inline: false });
                };

                await roleLogsChannel.send({ embeds: [roleUpdateLog] });
                log.info(`${target!.username} | Roles Updated`);
            break;

        };   
    }
};
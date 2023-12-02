import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { CustomClient } from "..";
import { inviteDB, tempRoleDB } from "@handlers/db";
import { log, errLog } from "@handlers/logger";

async function remRole(client: CustomClient, target: string, role: string) {
    var guild = await client.guilds.cache.get(process.env.TEST_GUILD_ID!);
    if (!guild) return log.error(`Could not fetch guild`);
    var user = await guild.members.fetch(target);
    if (!user) return log.error(`Could not fetch user ${target}`);

    await user.roles.remove(role);
    await tempRoleDB.destroy({where: {user: target, role: role}});
};

module.exports = {
    name: "ready",
    once: true,

    async execute(client: CustomClient) {
        const guild: Guild | undefined = client.guilds.cache.get(process.env.TEST_GUILD_ID!);
        if (!guild) return errLog(client, "Guild not found.", false);
        log.info(`${client.user?.username} Is Online`);
        var onlineTimestamp = Math.round(Date.now()*0.001);
        const restartEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Bot Restart')
            .setDescription('Bot has Been Restarted')
            .addFields(
                 { name: 'Started', value: `<t:${onlineTimestamp}:R>` },
            //     { name: '\u200B', value: '\u200B' },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            //     { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setTimestamp()
            .setFooter({ text: 'Time Restarted'});

            client.user!.setPresence({ activities: [{ name: 'Over Stuff', type:3 }], status: 'dnd' });

        (client.channels.cache.get(process.env.RESTART_ID!) as TextChannel).send({ embeds: [restartEmbed]})

        // ****************************
        // Pull invite data from the server and make sure its cached in the database correctly
        // ****************************

        // Cache invites on the server
        const guildInvites = await guild.invites.fetch();
        guildInvites.forEach(async (invite: any) => {
            let inviteData = await inviteDB.findOne({ where: { code: invite.code } });
            if (inviteData) {
                if (inviteData.uses != invite.uses) {
                    inviteDB.update({ uses: invite.uses as number }, { where: { code: invite.code } });
                };
            } else {
                inviteDB.create({
                    code: invite.code,
                    authorID: invite.inviterId as string,
                    uses: invite.uses as number,
                });
            };
        })

        // Filter through the ones on the DB and see if they are still active
        const inviteDBData = await inviteDB.findAll();
        inviteDBData.forEach(async (entry: { code: any; }) => {
            try {
                const invite = await guild.invites.fetch(entry.code);
                if (!invite) {
                    inviteDB.destroy({ where: { code: entry.code } });
                };
            } catch {
                inviteDB.destroy({ where: { code: entry.code } });
            };
        });
        
        const tempRoleData = await tempRoleDB.findAll();
        tempRoleData.forEach(async (entry: {user: string, role: string, whenAdded: number, whenToRemove: number}) => {
            var remTime = entry.whenToRemove
            var when = await remTime-Date.now();
            setTimeout(remRole, when, client, entry.user, entry.role);
        })
    }
}
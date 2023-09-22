import { EmbedBuilder, GuildMember, UserContextMenuCommandInteraction } from 'discord.js';
import { userDB } from '../../../handlers/db.ts';

function getUserBitFlags(bitflags: string): string {
  const bitflagsNumber = parseInt(bitflags, 10);

  if (isNaN(bitflagsNumber)) {
    return '';
  }

  const bitFlags: string[] = [];

  if (bitflagsNumber & (1 << 0)) {
    bitFlags.push('DiscordEmployee');
  }
  if (bitflagsNumber & (1 << 1)) {
    bitFlags.push('PartneredServerOwner');
  }
  if (bitflagsNumber & (1 << 2)) {
    bitFlags.push('Hypesquad');
  }
  if (bitflagsNumber & (1 << 3)) {
    bitFlags.push('BugHunterLevel1');
  }

  if (bitflagsNumber & (1 << 6)) {
    bitFlags.push('HypeSquadBravery');
  }
  if (bitflagsNumber & (1 << 7)) {
    bitFlags.push('HypeSquadBrilliance');
  }
  if (bitflagsNumber & (1 << 8)) {
    bitFlags.push('HypeSquadBalance');
  }
  if (bitflagsNumber & (1 << 9)) {
    bitFlags.push('PremiumEarlySupporter');
  }
  if (bitflagsNumber & (1 << 10)) {
    bitFlags.push('TeamPseudoUser');
  }

  if (bitflagsNumber & (1 << 14)) {
    bitFlags.push('BugHunterLevel2');
  }

  if (bitflagsNumber & (1 << 16)) {
    bitFlags.push('VerifiedBot');
  }
  if (bitflagsNumber & (1 << 17)) {
    bitFlags.push('EarlyVerifiedBotDeveloper');
  }
  if (bitflagsNumber & (1 << 18)) {
    bitFlags.push('CertifiedModerator');
  }
  if (bitflagsNumber & (1 << 19)) {
    bitFlags.push('BotHTTPInteractions');
  }

  if (bitflagsNumber & (1 << 22)) {
    bitFlags.push('ActiveDeveloper');
  }

  const bitFlagString = bitFlags
    .join(', ')
    .replace(/([A-Z])/g, ' $1')
    .trim();

  return bitFlagString;
}

function getGuildBitFlags(bitflags: string): string {
  const bitflagsNumber = parseInt(bitflags, 10);

  if (isNaN(bitflagsNumber)) {
    return '';
  }

  const bitFlags: string[] = [];

  if (bitflagsNumber & (1 << 0)) {
    bitFlags.push('DidRejoin');
  }
  if (bitflagsNumber & (1 << 1)) {
    bitFlags.push('CompletedOnboarding');
  }
  if (bitflagsNumber & (1 << 2)) {
    bitFlags.push('BypassesVerification');
  }
  if (bitflagsNumber & (1 << 3)) {
    bitFlags.push('StartedOnboarding');
  }

  if (bitflagsNumber & (1 << 5)) {
    bitFlags.push('StartedHomeActions');
  }
  if (bitflagsNumber & (1 << 6)) {
    bitFlags.push('CompletedHomeActions');
  }
  if (bitflagsNumber & (1 << 7)) {
    bitFlags.push('AutomodQuarantinedUsernameOrGuildNickname');
  }
  if (bitflagsNumber & (1 << 8)) {
    bitFlags.push('AutomodQuarantinedBio');
  }

  const bitFlagString = bitFlags
    .join(', ')
    .replace(/([A-Z])/g, ' $1')
    .trim();

  return bitFlagString;
}

module.exports = {
  data: {
    name: 'User Info',
    type: 2,
  },

  async execute(interaction: UserContextMenuCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    // Get information from the command
    let user = interaction.guild!.members.cache.get((interaction.targetMember! as GuildMember).id) as GuildMember;

    // UserData
    let userData = await userDB.findOne({ where: { userID: user.id } });
    if (userData === null) {
      // If the user is not in the database, add them
      userData = await userDB.create({ userID: user.id });
    }
    var cTimestamp = user.user.createdTimestamp.toString().substring(0, user.user.createdTimestamp.toString().length - 3);
    var jTimestamp = user.joinedTimestamp!.toString().substring(0, user.joinedTimestamp!.toString().length - 3);
    var roleListRaw = `<@&${user.roles.cache.map((role: { id: any }) => role.id).join('>, <@&')}>`;
    var lastRoleIndex = roleListRaw.lastIndexOf(', ');
    var roleList = roleListRaw.substring(0, lastRoleIndex);

    // Make sure the returned role list isn't empty
    if (roleList === '') {
      roleList = 'None';
    }

    // Create the embed
    let whois = new EmbedBuilder()
      .setColor(0x00ae86)
      .setTitle(`whois - ${user.displayName}`)
      .setDescription(`AKA <@${user.id}>`)
      .addFields(
        { name: 'ID', value: user.id, inline: false },
        { name: 'Account Created', value: `<t:${cTimestamp}:R>`, inline: true },
        { name: 'Joined Server', value: `<t:${jTimestamp}:R>`, inline: true },
      )
      .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.user.avatar}.png?size=1024`);

    if (userData.inviterID) {
      if (userData.inviterID !== 'N/A') {
        whois.addFields({
          name: 'Inviter',
          value: `<@${userData.inviterID}>`,
          inline: true,
        });
      }
    }

    if (userData.joinCount > 0) {
      whois.addFields({
        name: 'Join Count',
        value: `${userData.joinCount}`,
        inline: true,
      });
    }

    whois.addFields({ name: 'Roles', value: `${roleList}`, inline: false });

    // Bitfield stuff

    // User
    let userFlags = getUserBitFlags(user!.user.flags!.bitfield.toString());
    if (userFlags.length > 0) {
      whois.addFields({ name: 'User Flags', value: userFlags, inline: false });
    }

    // Guild
    let guildFlags = getGuildBitFlags(user!.flags?.bitfield.toString());
    if (guildFlags.length > 0) {
      whois.addFields({
        name: 'Guild Flags',
        value: guildFlags,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [whois] });
  },
};
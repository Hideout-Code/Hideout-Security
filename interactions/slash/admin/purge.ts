import { ChatInputCommandInteraction, Collection, Message, SlashCommandBuilder, TextChannel } from 'discord.js';

module.exports = {
  // The data needed to register slash commands to Discord.
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge Messages.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('any')
        .setDescription('Purge any message.')
        .addIntegerOption((int) => int.setName('amount').setDescription('Amount of messages to purge. (Max 100)').setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('Purge Messages from a specific user.')
        .addUserOption((user) => user.setName('user').setDescription('User to purge messages from.').setRequired(true))
        .addIntegerOption((int) => int.setName('amount').setDescription('Amount of messages to purge. (Max 100)').setRequired(true)),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    let response = await interaction.deferReply({ fetchReply: true });
    let msgsToDelete: Collection<string, Message>;
    let msgNum = interaction.options.getInteger('amount', true);
    if (msgNum! > 100) return interaction.editReply('You can only purge up to 100 messages at a time.');

    let command = interaction.options.getSubcommand(true);

    switch (command) {
      case 'any':
        msgsToDelete = await interaction.channel!.messages.fetch({ limit: msgNum!, before: response.id });
        break;
      case 'user':
        msgsToDelete = await interaction.channel!.messages.fetch({ limit: msgNum! });
        msgsToDelete = await msgsToDelete.filter((m) => m.author.id === interaction.options.getUser('user', true).id);
        break;
    }
    let deletedMsgs = await (interaction.channel! as TextChannel).bulkDelete(msgsToDelete!, true);

    // Send confirmation
    await interaction.editReply(`Purged ${deletedMsgs.size} messages.`);
  },
};
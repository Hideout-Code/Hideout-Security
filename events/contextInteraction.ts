import { log, errLog, intLog } from '@handlers/logger.ts';
import { Interaction } from 'discord.js';
import { CustomClient } from '../index.ts';
import { blacklistCheck } from '@handlers/db.ts';

module.exports = {
  name: 'interactionCreate',

  execute: async (interaction: Interaction) => {
    // Deconstructed client from interaction object.
    const client = interaction.client as CustomClient;

    // Checks if the interaction is a button interaction (to prevent weird bugs)

    if (!interaction.isContextMenuCommand()) return;

    /**********************************************************************/

    // Checks if the interaction target was a user

    if (interaction.isUserContextMenuCommand()) {
      const command = client.contextCommands.get('USER ' + interaction.commandName);

      // A try to execute the interaction.

      var isBlacklisted = await blacklistCheck(interaction.user.id);
      if (isBlacklisted) {
        await interaction.reply({
          content: 'You are blacklisted from interacting with me!',
          ephemeral: true,
        });
        return;
      }

      try {
        intLog(interaction);
        await command.execute(interaction);
        return;
      } catch (err: any) {
        errLog(client, err);
        await interaction.reply({
          content: 'There was an issue while executing that context command!',
          ephemeral: true,
        });
        return;
      }
    }
    // Checks if the interaction target was a user
    else if (interaction.isMessageContextMenuCommand()) {
      const command = client.contextCommands.get('MESSAGE ' + interaction.commandName);

      // A try to execute the interaction.

      try {
        intLog(interaction);
        await command.execute(interaction);
        return;
      } catch (err: any) {
        errLog(client, err);
        await interaction.reply({
          content: 'There was an issue while executing that context command!',
          ephemeral: true,
        });
        return;
      }
    }

    // Practically not possible, but we are still caching the bug.
    // Possible Fix is a restart!
    else {
      return log.error('Something weird happening in context menu. Received a context menu of unknown type.');
    }
  },
};
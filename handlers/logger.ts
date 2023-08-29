import * as fs from 'fs';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { CustomClient } from '..';
import { AttachmentBuilder, ChatInputCommandInteraction, ContextMenuCommandInteraction, EmbedBuilder, Interaction, TextChannel } from 'discord.js';

const config = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  },
};

const { combine, timestamp, printf, colorize } = winston.format;

const consoleTransport = new winston.transports.Console({
  level: process.env.LOGLEVEL || 'info',
  handleExceptions: true,
  format: combine(
    colorize({
      all: true,
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        trace: 'cyan',
      },
    }),
  ),
});

const fileRotateTransportCombined = new winston.transports.DailyRotateFile({
  level: 'trace',
  filename: './logs/trace-%DATE%.log',
  datePattern: 'MM-DD-YYYY',
  maxFiles: '14d',
});

const fileRotateTransportWarn = new winston.transports.DailyRotateFile({
  level: 'warn',
  filename: './logs/warn-%DATE%.log',
  datePattern: 'MM-DD-YYYY',
  maxFiles: '14d',
});

export const log = winston.createLogger({
  level: 'trace',
  levels: config.levels,
  format: combine(
    winston.format((info) => {
      info.level = info.level.toUpperCase();
      return info;
    })(),
    timestamp({
      format: 'MM-DD-YYYY hh:mm:ss.SSS A',
    }),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
  ),
  transports: [consoleTransport, fileRotateTransportCombined, fileRotateTransportWarn],
  exceptionHandlers: [fileRotateTransportWarn],
  rejectionHandlers: [fileRotateTransportWarn],
  exitOnError: false,
}) as winston.Logger & Record<keyof (typeof config)['levels'], winston.LeveledLogMethod>;
export default log;

export async function errLog(client: CustomClient, error: string, recoverable = true) {
  log.error(error);
  const msgContent = 'Hey ya broke something.';

  if (error.length > 1000) {
    await fs.promises.writeFile('./error.txt', error).catch((error) => log.error(error));
    const errorLog = new AttachmentBuilder('./error.txt', {
      name: 'error.txt',
    });
    await client.users.send(process.env.OWNER!, {
      content: msgContent,
      files: [errorLog],
    });
    return;
  } else {
    await client.users.send(process.env.OWNER!, {
      content: `${msgContent}\n\`\`\`js\n${error}\n\`\`\``,
    });
  }

  if (!recoverable) {
    await client.users.send(process.env.OWNER!, {
      content: '***Nonrecoverable***',
    });
    process.exit(1);
  }
}

function logEmbed(title: string, interaction: Interaction, cmdName: string, data?: any) {
  const embed = new EmbedBuilder()
    .setTitle(`Executed By`)
    .setDescription(`<@${interaction.user.id}>`)
    .setColor('#00ff00')
    .setAuthor({
      name: `${title} - ${cmdName}`,
      iconURL: interaction.user.avatarURL() || undefined,
    })
    .setFooter({ text: `User ID: ${interaction.user.id}` })
    .setTimestamp();

  if (!data) return embed;

  if (data.length > 0) {
    embed.addFields({ name: 'Options', value: ' ', inline: false });
    for (const item of data) {
      switch (item.type) {
        case 3: // string
          const value = item.value.length > 1000 ? 'Too big to display' : `\`${item.value}\``;
          embed.addFields({ name: item.name, value, inline: true });
          break;
        case 6: // user
          embed.addFields({
            name: 'User',
            value: `<@${item.value}>`,
            inline: true,
          });
          break;
        case 8: // role
          embed.addFields({
            name: 'Role',
            value: `<@&${item.value}>`,
            inline: true,
          });
          break;
        case 7: // channel
          embed.addFields({
            name: 'Channel',
            value: `<#${item.value}>`,
            inline: true,
          });
          break;
        default:
          embed.addFields({
            name: item.name,
            value: item.value.toString(),
            inline: true,
          });
          break;
      }
    }
  }

  return embed;
}

export async function intLog(interaction: Interaction) {
  const { user, client } = interaction;
  let intType: string;
  let cmdName: string;
  let data: {
    name: string;
    value: string | number | boolean | undefined | null;
    type: number | null;
  }[] = [];
  let consoleData = [];

  if (interaction.isChatInputCommand()) {
    intType = 'Slash Command';
    cmdName = interaction.commandName;
    if (interaction.options.getSubcommand(false)) {
      data.push({
        name: 'Sub Command',
        value: interaction.options.getSubcommand(false),
        type: null,
      });
      consoleData.push(`subcommand - ${interaction.options.getSubcommand(false)}`);
    }
  }

  if (interaction.isAnySelectMenu()) {
    intType = 'Select Menu';
    cmdName = interaction.customId;
  }
  if (interaction.isModalSubmit()) {
    intType = 'Modal';
    cmdName = interaction.customId;
  }
  if (interaction.isButton()) {
    intType = 'Button';
    cmdName = interaction.customId;
  }
  if (interaction.isUserContextMenuCommand()) {
    intType = 'Context (User)';
    cmdName = interaction.commandName;
  }
  if (interaction.isMessageContextMenuCommand()) {
    intType = 'Context (Message)';
    cmdName = interaction.commandName;
  }

  const suppressedInteractions: Array<string> = ['refreshMcStatus'];
  if (suppressedInteractions.includes(cmdName!)) return;

  switch (intType!) {
    case 'Slash Command':
      const slashInteraction = interaction as ChatInputCommandInteraction;
      if (slashInteraction.options.data.length > 0) {
        const intOptions =
          slashInteraction.options.data[0].type === 1 ? slashInteraction.options.data[0].options ?? [] : slashInteraction.options.data;

        for (const option of intOptions) {
          const optionValue = option.value!.toString().length > 1000 ? 'Too big to display' : option.value;

          data.push({
            name: option.name,
            value: optionValue,
            type: option.type,
          });
          consoleData.push(`${option.name} - ${optionValue}`);
        }

        await (client.channels.cache.get(process.env.COMMAND_LOGS!) as TextChannel).send({
          embeds: [logEmbed('Slash Command', interaction, cmdName!, data)],
        });
        log.info(`${intType} | ${cmdName!} | Called by ${user.username}`, data);
      } else {
        log.info(`${intType} | ${cmdName!} | Called by ${user.username}`);
      }
      break;

    case 'Context (User)':
      const contextInteraction = interaction as ContextMenuCommandInteraction;
      data.push({ name: 'User', value: contextInteraction.targetId, type: 6 });

      await (client.channels.cache.get(process.env.COMMAND_LOGS!) as TextChannel).send({
        embeds: [logEmbed('Context (User)', interaction, cmdName!, data)],
      });
      log.info(`${intType!} | ${cmdName!} | Called by ${user.username} | Ran on ${user.username}`);
      break;

    default:
      await (client.channels.cache.get(process.env.COMMAND_LOGS!) as TextChannel).send({ embeds: [logEmbed(intType!, interaction, cmdName!)] });
      log.info(`${intType!} | ${cmdName!} | Called by ${user.username}`);
      break;
  }

  return;
}

import { Collection, ChannelType, Message, Guild } from "discord.js";
import { log, errLog } from '@handlers/logger.ts';
import { MessageDB, userDB } from '@handlers/db.ts';
import { CustomClient } from "..";

// Prefix regex, we will use to match in mention prefix.
const escapeRegex = (string: string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

async function updateMSGCounter(client: CustomClient, userID: any) {
	let userData: any;
	try {
		userData = await userDB.findOne({ where: { userID: userID } });
	} catch {
		try {
			userData = await userDB.create({ userID: userID });
		} catch (error: any) {
			errLog(client, error);
			return;
		};
	};

	let msgCount: number;
	try {
		if (userData.messageCounter === null) {
			msgCount = 0;
		} else {
			msgCount = userData.messageCounter;
		};
		msgCount++;
		await userDB.update({ messageCounter: msgCount }, { where: { userID: userID } });
	} catch (error: any) {
		msgCount = 1;
		await userDB.update({ messageCounter: msgCount }, { where: { userID: userID } });
		return;
	};
}

module.exports = {
	name: "messageCreate",

	async execute(message: Message) {
		// Make the event guild specific
		if (message.guildId !== process.env.TEST_GUILD_ID) return;
		// If message is a bot, stop
		if (message.author.bot) return;		

		// Declares const to be used.
		const { content, } = message;
		const client = message.client as CustomClient;

		// Link Access
        const guildObj: Guild | undefined = client.guilds.cache.get(process.env.TEST_GUILD_ID);
		if (!guildObj) return errLog(client, "Guild not found.", false);
        await guildObj.members.fetch();

		// Checks if the bot is mentioned in the message all alone and triggers onMention trigger.

		if (
			message.content == `<@${client.user!.id}>` ||
			message.content == `<@!${client.user!.id}>`
		) {
			require("../messages/onMention").execute(message);
			return;
		}

		// Converts prefix to lowercase.
		let pref: string = `${process.env.PREFIX}`;
		const checkPrefix = pref.toLowerCase();

		// Regex expression for mention prefix

		const prefixRegex = new RegExp(
			`^(<@!?${client.user!.id}>|${escapeRegex(checkPrefix)})\\s*`
		);

		// Checks if message content in lower case starts with bot's mention.

		if (!prefixRegex.test(content.toLowerCase())) {
			var attachmentsArray = message.attachments.map((a: { proxyURL: any; }) => a.proxyURL);
			var attachments = attachmentsArray.join(", ");
			await MessageDB.create({
				id: message.id,
				userID: message.author.id,
				content: message.content,
				attachments: attachments,
			});
			await updateMSGCounter(client, message.author.id);
			return;
		};


		// Checks and returned matched prefix, either mention or prefix in config.

		const match = content.toLowerCase().match(prefixRegex);
		const [matchedPrefix] = match ? match : [""];

		// The Message Content of the received message separated by spaces (' ') in an array, this excludes prefix and command/alias itself.

		const args = content.slice(matchedPrefix.length).trim().split(/ +/);

		// Name of the command received from first argument of the args array.

		const commandName = args.shift()!.toLowerCase();

		// Check if message does not starts with prefix. If yes, return.

		if (!message.content.startsWith(matchedPrefix) || message.author.bot) {
			return;
		};

		// The message command object.

		const command =
			client.commands.get(commandName) ||
			client.commands.find(
				(cmd: { aliases: string | any[]; }) => cmd.aliases && cmd.aliases.includes(commandName)
			);

		// It it's not a command, return :)

		if (!command) return;

		// Owner Only Property, add in your command properties if true.

		if (command.ownerOnly && message.author.id !== process.env.OWNER) {
			return message.reply({ content: "This is a owner only command!" });
		}

		// Guild Only Property, add in your command properties if true.

		if (command.guildOnly && message.channel.type === ChannelType.DM) {
			return message.reply({
				content: "I can't execute that command inside DMs!",
			});
		}

		// Author perms property

		if (command.permissions && message.channel.type !== ChannelType.DM) {
			const authorPerms = message.channel.permissionsFor(message.author);
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return message.reply({ content: "You can not do this!" });
			}
		}

		// Args missing

		if (command.args && !args.length) {
			let reply = `You didn't provide any arguments, ${message.author}!`;

			if (command.usage) {
				reply += `\nThe proper usage would be: \`${process.env.PREFIX}${command.name} ${command.usage}\``;
			}

			return message.channel.send({ content: reply });
		}

		// Cooldowns

		const { cooldowns } = client;

		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply({
					content: `please wait ${timeLeft.toFixed(
						1
					)} more second(s) before reusing the \`${command.name}\` command.`,
				});
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(message, args);
		} catch (error) {
			log.error(error);
			message.reply({
				content: "There was an error trying to execute that command!",
			});
		}
	},
};

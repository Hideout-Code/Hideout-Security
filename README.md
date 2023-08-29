# Discord Bot
> Discord bot Templete.

[![Nodejs-Version][nodejs-image]][nodejs-url]
[![TS-Node-Version][ts-node-image]][ts-node-url]
[![TypeScript-Version][typescript-image]][typescript-url]
[![Discordjs-Version][discordjs-image]][discordjs-url]


## Installation
```sh
npm install
```
test

## Usage

After installing, edit `temp.env`.

* `PREFIX=` The text prefix used for text commands.
* `TOKEN=` Bot token here.
* `DB_*=` Corresponding DB to use.
* `OWNER=` Your Discord ID.
* `CLIENT_ID=` Discord ID of the bot account.
* `TEST_GUILD_ID=` Primary Server ID.
* `*_LOG=` The location for the corresponding log to be dumped.
* `STREAM_CHAT=` Chat channel ID for `/say` to only be accepted from.

Once done rename it to `.env` then build with typescript and run the bot.
```sh
npm run start
```

## Development setup
Do the above usage setup at least once, then install the dev dependencies.
```sh
npm install --dev
```

* Events are stored in `./events`
* Slash commands, Context Menus (etc, etc) are all in `./interactions`.
* Context Menus are separated by `user` or `message` context folders.

### Nodemon
Nodemon (v3.0.1) is included by the `devDependency` run it with:
```sh
npm run dev
```

### Visual Studio Code
The debugger is already setup and can be used with `Run and Debug` or the default bind `F5`.

<!-- Links and stuff-->
[nodejs-image]: https://img.shields.io/badge/Node.js-v16.20.0-yellow?style=for-the-badge&logo=nodedotjs
[nodejs-url]: https://nodejs.org/download/release/v16.20.0/
[ts-node-image]:https://img.shields.io/badge/TS_Node-v10.9.1-brightgreen?style=for-the-badge&logo=tsnode
[ts-node-url]:https://www.npmjs.com/package/ts-node/v/10.9.1
[typescript-image]: https://img.shields.io/badge/TypeScript-v5.0.4-green?style=for-the-badge&logo=tsnode
[typescript-url]: https://www.npmjs.com/package/typescript/v/5.0.4
[discordjs-image]: https://img.shields.io/badge/Discord.js-v14.13.0-brightgreen?style=for-the-badge&logo=discord
[discordjs-url]: https://www.npmjs.com/package/discord.js/v/14.13.0

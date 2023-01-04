const { Client, Collection, Events, GatewayIntentBits, Message } = require('discord.js');
const { token, adminIds } = require('./config.json');
const Keyv = require('keyv');

const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const dbFile = "database.sqlite"
if (!fs.existsSync("./" + dbFile)) {
	fs.writeSync("./" + dbFile)
}
const db = new Keyv('sqlite://'+dbFile);

const CHANNEL_NAME = "general" //"bot-shit"
const TAG_CHANNEL = "tagged-someone" //"test-tagged-someone"
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
// 	const filePath = path.join(commandsPath, file);
// 	const command = require(filePath);
// 	// Set a new item in the Collection with the key as the command name and the value as the exported module
// 	if ('data' in command && 'execute' in command) {
// 		client.commands.set(command.data.name, command);
// 	} else {
// 		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
// 	}
// }

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
	const id = message.author.username;

	if (message.author.bot) return;
	if (message.channel.name == TAG_CHANNEL) {
		if (!message.author.bot && message.content !== "$tagged") {
			message.delete()
		} else {
			const messages = await message.channel.messages.fetch({limit: 2})
			const lastMsg = messages.last();
			const seconds = Math.round((message.createdTimestamp - lastMsg.createdTimestamp)/1000)
			await db.set(id, (await getTime(id)) + seconds)
			message.channel.send(`${message.author.toString()} has now been tagged for ${await getTime(id)} seconds`)
		}
	} 
	if (!message.content.startsWith("$")) return

	const command = message.content.replace("$", "").split(" ")[0]
	console.log(command);
	if (message.channel.name == CHANNEL_NAME) {
		if (command == "init") {
			if (await db.get(id) !== undefined) {
				message.channel.send(`${message.author.toString()} has already been initiated`)
				return
			} else {
				db.set(id, 0)
				message.channel.send(`Initiated user ${message.author.toString()}`)
			}
		
		}
		if (command == "ping") {
			message.reply("pong")
		}
		if (command == "user") {
			const time = await db.get(id)
			if (time == undefined) {
				message.channel.send(`${message.author.toString()} cannot be found`)
			} else message.channel.send(`${message.author.toString()} has been tagged for ${time} seconds`)
		} if (command == "reset" && adminIds.includes(message.author.id)) {
			db.clear()
			message.channel.send("The database has been reset!")
		}
	}

})



// client.on(Events.InteractionCreate, async interaction => {
// 	if (!interaction.isChatInputCommand()) return;
	
// 	const command = interaction.client.commands.get(interaction.commandName);

// 	if (!command) {
// 		console.error(`No command matching ${interaction.commandName} was found.`);
// 		return;
// 	}

// 	try {
// 		await command.execute(interaction);
// 	} catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}
// });

client.login(token);

const getTime = async (id) => {
	return await db.get(id)
}
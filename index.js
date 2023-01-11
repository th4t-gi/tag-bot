require('dotenv').config()
const { Client, Collection, Events, GatewayIntentBits, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, ActivityType } = require('discord.js');
const { dbName, devDatabaseName, dev } = require('./config.json');
const Keyv = require('keyv');
const {parseTime, createTagButtonRow, updateStandings, getNickname} = require("./utils")

const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

if (!fs.existsSync("./" + dbName)) {
	fs.writeFileSync("./" + dbName, "")
}
const db = dev ? new Keyv('sqlite://'+dbName) : new Keyv('sqlite://'+devDatabaseName);

//Finds Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

//Ready Event
client.once(Events.ClientReady, c => {
	if (dev) client.user.setActivity("the bot crash over and over", {type: ActivityType.Watching})
	else client.user.setActivity("tag", {type: ActivityType.Playing})
	console.log(`Ready! Logged in as ${c.user.tag}`);
});


client.on(Events.InteractionCreate, async interaction => {
	// await interaction.deferReply({ephemeral: true})
	//Slash Commands
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;
	
		try {
			await command.execute(interaction, db, dev);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	//When someone clicks the "I tagged someone Button"
	if (interaction.isButton() && interaction.customId == "tag_button") {
		const curr = await db.get("current")
		const time = Date.now() - (await db.get('last_tag'))
		const cooldown = 15*60*1000
		console.log(time, parseTime(cooldown));

		//Filters out if the user isn't "it" and the cooldown
		if (curr !== interaction.user.id) {
			interaction.reply({ content: 'You are not it! You can\'t tag someone right now you silly goose!', ephemeral: true })
		} else if (time < cooldown) {
			interaction.reply({ content: `Not yet you impatient fuck! You need to wait for ${parseTime(cooldown - time)}`, ephemeral: true })
		} else {
			await interaction.deferReply({ephemeral: true})
			//creates Dropdown Menue
			const userSelect = new ActionRowBuilder().addComponents(
      	new UserSelectMenuBuilder()
       	  .setCustomId('userSelect')
       	  .setPlaceholder('Nothing selected')
					.setMaxValues(1)
   	  );
			await interaction.editReply({content: `Who did you tag ${await getNickname(interaction, interaction.user.id)}? It's okay, you can tell me`, ephemeral: true, components: [userSelect]})
			console.log("[tagging_button]");
			interaction.message.delete()
		}
	}
	//When the user selects who they tagged
	if (interaction.isUserSelectMenu() && interaction.customId == "userSelect") {
		await interaction.reply(`<@${interaction.user.id}> has tagged someone!`)
		const milliseconds = Date.now() - await db.get("last_tag")
		console.log("[userSelect] - time added", milliseconds)
		console.log("[userSelect]{interaction.message}", interaction.message);
		//Updates user's time
		await db.set(interaction.user.id, (await db.get(interaction.user.id)) + milliseconds)

		interaction.followUp({ content: 'Let the glorious game of Tag continue!', components: [createTagButtonRow()] })
		
		updateStandings(interaction, db)

		db.set("current", interaction.users.first().id)
		db.set("last_tag", Date.now())
	}
	
});

process.on('unhandledRejection', async error => {
	console.error('Unhandled promise rejection:', error);
	const botChannel = await client.channels.fetch("1060038702837014628")
	botChannel.send("An error just occurred:\n" + error.message)
});

// client.on(Events.Error, })

client.login(process.env.DISCORD_TOKEN);
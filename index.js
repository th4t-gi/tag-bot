require('dotenv').config()
const { Client, Collection, Events, GatewayIntentBits, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, ActivityType } = require('discord.js');
const { dbName, devDatabaseName, dev, cooldown } = require('./config.json');
const Keyv = require('keyv');
const {parseTime, createTagButtonRow, updateStandings, getNickname} = require("./utils")

const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

if (!fs.existsSync("./" + dbName)) {
	console.log("generating Database");
	fs.writeFileSync("./" + dbName, "")
}
const db = dev ? new Keyv('sqlite://'+devDatabaseName) : new Keyv('sqlite://'+dbName);

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
		await interaction.deferReply({ephemeral: true})
		if (interaction.message.id !== (await db.get("last_tag_msg"))) {
			interaction.editReply("This is an old button, there should be a newer one!")
			return
		}
		
		const curr = await db.get("current")
		const time = Date.now() - (await db.get('last_tag'))
		// const cooldown = 15*60*1000
		console.log(time);

		//Filters out if the user isn't "it" and the cooldown
		if (curr !== interaction.user.id) {
			interaction.editReply({ content: 'You can\'t tag someone right now you silly goose! You are not it!\nIf you are actually it and the dumdum that tagged you selected the wrong person, use the `/set-tagged` command and use the button again.', ephemeral: true })
		} else if (time < cooldown) {
			interaction.editReply({ content: `Not yet you impatient fuck! You need to wait for ${parseTime(cooldown - time)}`, ephemeral: true })
		} else {
			//creates Dropdown Menue
			const userSelect = new ActionRowBuilder().addComponents(
      	new UserSelectMenuBuilder()
       	  .setCustomId('userSelect')
       	  .setPlaceholder('Nothing selected')
					.setMaxValues(1)
   	  );
			await interaction.editReply({content: `Who did you tag ${await getNickname(interaction, interaction.user.id)}? It's okay, you can tell me`, ephemeral: true, components: [userSelect]})
			console.log("[tagging_button]");
		}
	}
	//When the user selects who they tagged
	if (interaction.isUserSelectMenu() && interaction.customId == "userSelect") {
		const milliseconds = Date.now() - await db.get("last_tag")
		console.log("[userSelect] - time added", milliseconds)

		await interaction.reply(`<@${interaction.user.id}> has tagged someone!`)
		//Updates user's time
		await db.set(interaction.user.id, (await db.get(interaction.user.id)) + milliseconds)
		
		updateStandings(interaction, db)

		db.set("current", interaction.users.first().id)
		db.set("last_tag", Date.now())
		db.get("last_tag_msg").then(async msgId => {
			(await interaction.channel.messages.fetch(msgId)).delete()
		})

		interaction.followUp({ content: 'Let the glorious game of Tag continue!', components: [createTagButtonRow()] }).then(msg => {
			db.set("last_tag_msg", msg.id)
		})
	}
	
});

process.on('unhandledRejection', async error => {
	console.error('Unhandled promise rejection:', error);
	const botChannel = await client.channels.fetch("1060038702837014628")
	botChannel.send("An error just occurred:\n" + error.message)
});

// client.on(Events.Error, })

client.login(process.env.DISCORD_TOKEN);
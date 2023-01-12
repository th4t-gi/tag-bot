const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector, } = require('discord.js');
const { dbName, devDatabaseName, dev, adminIds } = require("../config.json")
const Keyv = require('keyv');
const { getStandings, parseTime } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('database')
		.setDescription("Prints database in json format")
    .addBooleanOption(option =>
      option.setName('humanize')
        .setDescription('Humanizes the time and ID\'s')
    ).addBooleanOption(option =>
      option.setName('dev')
        .setDescription('Uses the dev database or not. Defaults to false')
    ),
	async execute(interaction, db) {
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }
    await interaction.deferReply()
    if (interaction.options.getBoolean("dev")) {
      db = new Keyv('sqlite://'+devDatabaseName);
    } else {
      db = new Keyv('sqlite://'+dbName);
    }
    let standings = [];
    //Get all ids of users
    for await (const [key, value] of db.iterator()) {
      standings.push({key, value})
    }
    console.log(standings);
  
    //map user object to nickname/username and milisecond time to hh:mm:ss
    if (interaction.options.getBoolean("humanize")) {
      standings = await Promise.all(standings.map(async (v, i) => {
        if (v.key == "last_tag") {
          return {key: v.key, value: new Date(v.value).toLocaleString()}
        } else if (v.key == "current") {
          const user = await interaction.guild.members.fetch(v.value)
          return {key: v.key, value: (user.nickname||user.user.username)}
        } else if (v.key == "last_tag_msg") {
          return v
        } else {
          const user = await interaction.guild.members.fetch(v.key)
          return {key: (user.nickname||user.user.username), value: parseTime(v.value)}
        }
      }))
    }

    interaction.editReply("Here's the `" + (interaction.options.getBoolean("dev")? devDatabaseName:dbName) + "` right now!\n```json\n" + JSON.stringify(standings) + "```")
  }
}
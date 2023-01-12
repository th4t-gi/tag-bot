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
        
    ),
	async execute(interaction, db) {
    // const db = new Keyv('sqlite://'+dbName);    
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    } 
    await interaction.deferReply()
    let standings = [];
    //Get all ids of users
    for await (const [key, value] of db.iterator()) {
      standings.push({key, value})
    }
    console.log(standings);
  
    //map user object to nickname/username and milisecond time to hh:mm:ss
    if (interaction.options.getBoolean("humanize")) {
      standings = await Promise.all(standings.map(async (v, i) => {
        console.log(v);
        if (v.key == "last_tag") {
          return {key: "last_tag", value: new Date(v.value).toLocaleString()}
        } else if (v.key == "current") {
          const user = await interaction.guild.members.fetch(v.value)
          return {key: "current", value: (user.nickname||user.user.username)}
        } else {
          const user = await interaction.guild.members.fetch(v.key)
          return {key: (user.nickname||user.user.username), value: parseTime(v.value)}
        }
      }))
    }

    interaction.editReply("Here's the `" + (dev? devDatabaseName:dbName) + "` right now!\n```json\n" + JSON.stringify(standings) + "```")
  }
}
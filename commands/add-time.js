const { SlashCommandBuilder } = require('discord.js');
const { adminIds } = require("../config.json")
const { getNickname, parseTime } = require("../utils")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-time')
		.setDescription('Adds time to a given user')
    .addUserOption(option => option.setName("user").setDescription("User to be add time to. Defaults to sender.").setRequired(true))
    .addIntegerOption(option => option.setName("seconds").setDescription("Amount of time in seconds to add").setRequired(true)),
	async execute(interaction, db) {
    // const db = new Keyv('sqlite://'+dbName);
    const userId = interaction.options.getUser('user').id;
    const time = interaction.options.getInteger('seconds')*1000
    
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }
    if (!((await db.get(userId))+1)) interaction.reply(`${await getNickname(interaction, userId)} cannot be found`)
    else {
      console.log("Added time", time, (await db.get(userId))+time);
      db.set(userId, (await db.get(userId))+time)
      let neg = time < 1
      interaction.reply(`Successfully ${neg ? "removed" : "added"} ${parseTime(time)} to ${await getNickname(interaction, userId)}`)
    }
  }
}
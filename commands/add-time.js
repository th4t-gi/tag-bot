const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const { dbName, adminIds } = require("../config.json")
const Keyv = require('keyv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-time')
		.setDescription('Adds time to a given user')
    .addUserOption(option => option.setName("user").setDescription("User to be add time to. Defaults to sender.").setRequired(true))
    .addIntegerOption(option => option.setName("seconds").setDescription("Amount of time in seconds to add").setRequired(true)),
	async execute(interaction) {
    const db = new Keyv('sqlite://'+dbName);
    const user = interaction.options.getUser('user') || interaction.user;
    const time = interaction.options.getInteger('seconds')*1000
    
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }
    console.log((await db.get(user.username))+time);
    db.set(user.username, (await db.get(user.username))+time)
    interaction.reply(`Successfully added ${time} milliseconds to ${user.username}`)
  }
}
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const { dbName, adminIds } = require("../config.json")
const Keyv = require('keyv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-tagged')
		.setDescription('Overrides who is currently it, does not reset when the last tag happened')
    .addUserOption(option => option.setName("user").setDescription("User to be set as 'it'. Defaults to sender.")),
	async execute(interaction) {
    const db = new Keyv('sqlite://'+dbName);
    const user = interaction.options.getUser('user') || interaction.user;
    
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }

    db.set('current', user.username)
    interaction.reply("Successfully reset who is 'it'.")
  }
}
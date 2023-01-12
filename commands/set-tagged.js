const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const { dbName, adminIds } = require("../config.json")
const Keyv = require('keyv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-tagged')
		.setDescription("Overrides who is currently it. If not an admin, sets the sender as it.")
    .addUserOption(option => option.setName("user").setDescription("User to be set as 'it'. Can only be used if sender is an admin.")),
	async execute(interaction, db) {
    // const db = new Keyv('sqlite://'+dbName);
    const user = interaction.options.getUser('user') || interaction.user;
    
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      console.log("set tagged", interaction.user.id);
      db.set('current', interaction.user.id)
      interaction.reply({content: "Okay, you are now it! If you aren't it, tell Evan or Judd to set who is actually it!", ephemeral: true})
      return
    } else {
      console.log("set tagged", user.id);
      db.set('current', user.id)
      interaction.reply("Successfully reset who is 'it'.")
    }
  }
}
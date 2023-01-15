const { SlashCommandBuilder } = require('discord.js');
const { adminIds } = require("../config.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-tagged')
		.setDescription("Overrides who is currently it. If not an admin, sets the sender as it.")
    .addUserOption(option => option.setName("user").setDescription("User to be set as 'it'. Can only be used if sender is an admin.")),
	async execute(interaction, dynamo) {
    // const db = new Keyv('sqlite://'+dbName);
    const user = interaction.options.getUser('user') || interaction.user;
    
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      console.log("set tagged", interaction.user.id);
      dynamo.update('current', {user_id: interaction.user.id})
      return interaction.reply({content: "Okay, you are now it! Use the button to tag someone else! If you aren't it, tell Evan or Judd to set who is actually it!", ephemeral: true})
    } else {
      console.log("set tagged", user.id);
      dynamo.update('current', {user_id: user.id})
      return interaction.reply("Successfully reset who is 'it'.")
    }
  }
}
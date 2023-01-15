const { SlashCommandBuilder } = require('discord.js');
const { adminIds } = require("../config.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-last-tagged')
		.setDescription('Overrides who is currently it, does not reset when the last tag happened')
    .addIntegerOption(option => option.setName("time").setDescription("time to assign to the `last_tag` in milliseconds since the epoch").setRequired(true)),
	async execute(interaction, dynamo) {
    const time = interaction.options.getInteger("time")
    const date = new Date(time)
    
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      return interaction.reply("Sorry, but you can't use this command!")
    }

    dynamo.update("current", {last_tag: time})
    interaction.reply(`Successfully reset last_tag to ${date.toUTCString()}`)
  }
}
const { SlashCommandBuilder } = require('discord.js');
const {  adminIds } = require("../config.json")
const { createTagButtonRow } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-game')
		.setDescription('Let tagging begin!')
    .addUserOption(option => 
      option.setName("init_user")
      .setDescription("User to start off the game")
      .setRequired(true))
    .addChannelOption(option => 
      option.setName("standings").setDescription("The Channel that standings will update in").setRequired(true))
    .addBooleanOption(option => 
      option.setName("clear")
      .setDescription("If true, wipes the players times when starting.")
      .setRequired(true)),
	async execute(interaction, dynamo) {
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }
    const clear = interaction.options.getBoolean("clear") || false
    const userId = interaction.options.getUser('init_user').id;
    const standingsChannel = interaction.options.getChannel("standings")

    await interaction.deferReply()
    if (clear) {
      const standings = dynamo.getCache("standings")
      interaction.guild.channels.fetch(standings.channel).then(channel => {
        channel.messages.delete(standings.msg)
      })
      await dynamo.clear()
    }
    const text = clear ? 'Let the glorious game of Tag start!' : 'Let the glorious game of Tag continue!'
    await interaction.editReply({ content: text, components: [createTagButtonRow()] })
    dynamo.set("current", { last_tag: Date.now(), user_id: userId, last_tag_msg: interaction.channel.lastMessageId })
    dynamo.set("standings", {msg: "", channel: standingsChannel.id})

	},
};
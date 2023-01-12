const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');
const { dbName, adminIds } = require("../config.json")
const Keyv = require('keyv');
const { createTagButtonRow } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-game')
		.setDescription('Let tagging begin!')
    .addUserOption(option => 
      option.setName("init_user")
      .setDescription("User to start off the game")
      .setRequired(true))
    .addBooleanOption(option => 
      option.setName("clear")
      .setDescription("If true, wipes the players times when starting.")
      .setRequired(true)),
	async execute(interaction, db) {
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }
    const clear = interaction.options.getBoolean("clear") || false
    const user = interaction.options.getUser('init_user');
    // const db = new Keyv('sqlite://'+dbName);
    console.log(clear);
    if (clear) {
      db.clear()
    }
    const text = clear ? 'Let the glorious game of Tag start!' : 'Let the glorious game of Tag continue!'
    await interaction.reply({ content: text, components: [createTagButtonRow()] })

    db.set("current", user.id)
    db.set("last_tag", Date.now())
    db.set("last_tag_msg", interaction.channel.lastMessageId)
    
	},
};
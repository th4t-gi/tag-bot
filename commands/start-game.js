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
      .setRequired(true)),
	async execute(interaction) {
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }
    const user = interaction.options.getUser('init_user');
    const db = new Keyv('sqlite://'+dbName);

    db.clear()
    
    await interaction.reply({ content: 'Let the glorious game of Tag Start!', components: [createTagButtonRow()] });

    db.set("current", user.username)
    db.set("last_tag", Date.now())
    
	},
};
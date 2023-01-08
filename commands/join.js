const { SlashCommandBuilder } = require('discord.js');
const { dbName, adminIds } = require("../config.json")
const Keyv = require('keyv');
const { getNickname } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Adds a user to the Tag Game')
    .addUserOption(option => option.setName("user").setDescription("User to be added. Defaults to sender."))
    .addBooleanOption(option => option.setName("force").setDescription("Initializes user forcefully, will reset a user's time if already initiated.")),

	async execute(interaction, db) {
    const user = interaction.options.getUser('user') || interaction.user;

    const force = interaction.options.getBoolean("force") || false;
    // const db = new Keyv('sqlite://'+dbName);
    if (force && adminIds.includes(interaction.user.id)) {
      db.set(user.id, 0)
      interaction.reply(`Forcefuly initiated user ${await getNickname(interaction, user.id)}`)
    } else if (await db.get(user.id) !== undefined) {
      interaction.reply(`${await getNickname(interaction, user.id)} has already been initiated`)
      return
    } else {
      db.set(user.id, 0)
      interaction.reply(`Initiated ${await getNickname(interaction, user.id)}`)
    }
	},
};
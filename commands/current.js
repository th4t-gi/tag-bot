const { SlashCommandBuilder } = require('discord.js');
const { dbName } = require("../config.json")
const Keyv = require('keyv');
const {parseTime} = require('../utils')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('current')
		.setDescription('checks how long the current player has been tagged'),
	async execute(interaction) {
    const db = new Keyv('sqlite://'+dbName);
    const userIsTagged = interaction.user.username == (await db.get("current"))
    console.log("[/current]{last_tag}", await db.get('last_tag'));

    const time = Date.now() - (await db.get("last_tag"))


    if (userIsTagged) {
      interaction.reply({ content: `You have been tagged for ${parseTime(time)}`, ephemeral: true})
    } else {
      interaction.reply({ content: `The tagged person has been tagged for ${parseTime(time)}`, ephemeral: true})
    }
	},
};
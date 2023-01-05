const { SlashCommandBuilder } = require('discord.js');
const { dbName } = require("../config.json")
const Keyv = require('keyv');
const {parseTime} = require('../utils')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Gets the tag time of an individual user.')
    .addUserOption(option => 
      option.setName("user").setDescription("User to get the time of. Defaults to sender.")),
	async execute(interaction) {
    const db = new Keyv('sqlite://'+dbName);
    const user = interaction.options.getUser('user') || interaction.user;
    const time = await db.get(user.username)
    console.log("[/time]{time}", time);

    if (time == undefined) interaction.reply(`${user.username} cannot be found`)
    else interaction.reply(`${user.username} has been tagged for ${parseTime(time)}`)
	},
};
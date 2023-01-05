const { SlashCommandBuilder } = require('discord.js');
const { dbName, adminIds } = require("../config.json")
const Keyv = require('keyv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Adds a user to the Tag Game')
    .addUserOption(option => option.setName("user").setDescription("User to be added. Defaults to sender."))
    .addBooleanOption(option => option.setName("force").setDescription("Initializes user forcefully, will reset a user's time if already initiated.")),

	async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const force = interaction.options.getBoolean("force") || false;
    const db = new Keyv('sqlite://'+dbName);
    if (force && adminIds.includes(interaction.user.id)) {
      db.set(user.username, 0)
      interaction.reply(`Forcefuly initiated user ${user.username}`)
    } else if (await db.get(user.username) !== undefined) {
      interaction.reply(`${user.username} has already been initiated`)
      return
    } else {
      db.set(user.username, 0)
      interaction.reply(`Initiated user ${user.username}`)
    }
	},
};
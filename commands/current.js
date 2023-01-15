const { SlashCommandBuilder } = require('discord.js');
const { cooldown } = require("../config.json")
const {parseTime} = require('../utils')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('current')
		.setDescription('checks how long the current player has been tagged'),
	async execute(interaction, dynamo) {
    // await interaction.deferReply()
    // const curr = await dynamo.get("current")
    const curr = dynamo.getCache("current")
    const userIsTagged = interaction.user.id == curr.user_id
    console.log("[/current]{last_tag}", curr.last_tag);

    const time = Date.now() - curr.last_tag

    if (userIsTagged) {
      return interaction.reply({ content: `You have been tagged for ${parseTime(time)}${time < cooldown ? ". ("+ parseTime(cooldown - time) + " till cooldown ends)" : "" }`, ephemeral: true})
    } else {
      return interaction.reply({ content: `The tagged person has been tagged for ${parseTime(time)}`, ephemeral: true})
    }
	},
};
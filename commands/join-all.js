const { SlashCommandBuilder } = require('discord.js');
const { adminIds } = require("../config.json")
const { updateStandings } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join-all')
		.setDescription('Initiates everyone in the discord server as players')
    .addBooleanOption(option => option.setName("force").setDescription("Initializes user forcefully, will reset a user's time if already initiated.")),
	async execute(interaction, dynamo) {
    const force = interaction.options.getBoolean("force") || false;
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }

    interaction.reply("Initiating members...")
    console.log("Initiating members...");

    //Get list of all members
    interaction.member.guild.members.fetch().then(async members => {
      //Filter out bots
      Promise.all(members.filter(m => !m.user.bot).map(async m => {
        console.log(m.user.username, m.user.id);
        //initiate user
        const user = await dynamo.get(m.user.id)
        if (user !== undefined && !force) {
          interaction.channel.send(`${user.name} has already been initiated`)
        } else {
          dynamo.set(m.user.id, { time: 0, times_tagged: 0, name: m.nickname||m.user.username })
          interaction.channel.send(`Initiated ${m.nickname||m.user.username}`)
        }
      })).then(v => {
        updateStandings(interaction, dynamo)
      })
      
    })
	},
};
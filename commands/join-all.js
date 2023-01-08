const { SlashCommandBuilder } = require('discord.js');
const { dbName, adminIds } = require("../config.json")
const Keyv = require('keyv');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join-all')
		.setDescription('Initiates everyone in the discord server as players')
    .addBooleanOption(option => option.setName("force").setDescription("Initializes user forcefully, will reset a user's time if already initiated.")),
	async execute(interaction, db) {
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!")
      return
    }

    interaction.reply("Initiating members...")
    console.log("Initiating members...");
    // const db = new Keyv('sqlite://'+dbName);
    
    //Get list of all members
    interaction.member.guild.members.fetch().then(async members => {
      //Filter out bots
      await members.filter(m => !m.user.bot).forEach(async m => {
        console.log(m.user.username, m.user.id);
        //initiate user
        if (await db.get(m.user.id) !== undefined) {
          interaction.channel.send(`${m.nickname||m.user.username} has already been initiated`)
        } else {
          db.set(m.user.id, 0)
          interaction.channel.send(`Initiated ${m.nickname||m.user.username}`)
        }
      })
    })    
	},
};
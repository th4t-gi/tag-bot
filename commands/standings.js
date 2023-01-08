const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { dbName } = require("../config.json")
const Keyv = require('keyv');
const moment = require("moment");
const { parseTime, updateStandings } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('standings')
		.setDescription('Prints out the list of all players and their times'),
	async execute(interaction, db) {
    const standingsChannelId = "1061475249796948048"
    interaction.reply(`UPDATE: Check <#${standingsChannelId}> now instead!, you don't have to use the command!`)
    // await interaction.deferReply()
    // const db = new Keyv('sqlite://'+dbName);

    // const standings = updateStandings(interaction, db)
    // //Make Standings object
    // let standings = [];
    // for await (const [key, time] of db.iterator()) {
    //   if (key !== "last_tag" && key !== "current") {
    //     //TODO: This is super slow way of finding the names
    //     const user = (await interaction.member.guild.members.fetch({query: key, limit: 1 })).first()
    //     console.log(user);
    //     standings.push({user, time})
    //   }
    // }
    // //Sort list by by time
    // standings.sort((a, b) => a.time - b.time)
    // //map milisecond time to hh:mm:ss and user object to nickname/username
    // standings = standings.map((v, i) => {
    //   return {name: ""+(1+i)+". "+(v.user.nickname||v.user.user.username), value: parseTime(v.time)}
    // })
    // console.log(standings);

    //create Embed
    // const standingsEmbed = new EmbedBuilder()
    // .setColor(0x7289DA)
    // .setTitle('Tag Game Standings')
    // .setThumbnail('https://media.giphy.com/media/hvFUiCVOECDXJueNdy/giphy.gif')
    // .addFields(
    //   ...standings
    // )
    // .setTimestamp()

    // interaction.editReply({ embeds: [standingsEmbed] });
	},
};
const { SlashCommandBuilder } = require('discord.js');
const { updateStandings } = require('../utils');
const { adminIds } = require("../config.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('standings')
		.setDescription('Prints out the list of all players and their times'),
	async execute(interaction, db, dev) {
    const standingsChannelId = "1061475249796948048"
    // await interaction.deferReply()
    // const db = new Keyv('sqlite://'+dbName);

    if (dev || adminIds.includes(interaction.user.id)) updateStandings(interaction, db)
    interaction.reply(`UPDATE: Check <#${standingsChannelId}> now instead!, you don't have to use the command!`)
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
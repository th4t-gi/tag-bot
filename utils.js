const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');


module.exports = {
  createTagButtonRow: () => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('primary')
        .setLabel('I\'ve Tagged Someone!')
        .setStyle(ButtonStyle.Primary)
        .setCustomId("tag_button"),
    );
    return row;
  },

  parseTime: (ms) => {
    ms = Math.abs(ms)

    const seconds = ms/1000
    let h = Math.floor(seconds/3600);
    let m = Math.floor((seconds - (h * 3600)) / 60);
    let s = Math.floor(seconds - (h * 3600) - (m * 60));
    
    if (h && m < 10) m = "0"+m
    if (!m) m = "0"
    if (s < 10) s = "0" + s
    
    return (h? h + ":": "") + m + ":" + s
  },

  getNickname: async (interaction, id) => {
    const guildUser = (await interaction.guild.members.fetch(id))
    return guildUser.nickname || guildUser.user.username
  },
  updateStandings: async (interaction, dynamo) => {
    // await interaction.deferReply()
  
    dynamo.scan().then(async data => {
      //Get all ids of users
      let standings = Object.values(data).filter(obj => obj.id.length == 18)
      
      //Sort list by by time
      standings.sort((a, b) => a.time - b.time)

      standings = await Promise.all(standings.map(async (v, i) => {
        //map user object to nickname/username and milisecond time to hh:mm:ss
        const user = await interaction.guild.members.fetch(v.id)
        return {name: ""+(1+i)+". "+(user.nickname||user.user.username), value: module.exports.parseTime(v.time)}
      }))
      console.log("standings", standings);
      
      
      const standingsEmbed = new EmbedBuilder()
      .setColor(0x7289DA)
      .setTitle('Tag Game Standings')
      .setThumbnail('https://media.giphy.com/media/hvFUiCVOECDXJueNdy/giphy.gif')
      .addFields(
        ...standings
      )
      .setTimestamp()
      
      interaction.guild.channels.fetch(data.standings.channel).then(async channel => {
        if (data.standings.msg) channel.messages.fetch(data.standings.msg).then(msg => msg.edit({embeds: [standingsEmbed]}))
        else channel.send({embeds: [standingsEmbed]}).then(msg => {
          dynamo.update("standings", {msg: msg.id})
        })
      })
    })
  
    //create Embed

    
  
    // interaction.editReply({ embeds: [standingsEmbed] });
  }
  
}


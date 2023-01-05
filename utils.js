const {ActionRowBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js');

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

  parseTime: (time) => {
    const date = new Date(time);
    return date.toUTCString().split(' ')[4];
  }
}
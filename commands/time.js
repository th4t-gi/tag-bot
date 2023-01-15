const { SlashCommandBuilder } = require("discord.js");
const { parseTime, getNickname } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Gets the tag time of an individual user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to get the time of. Defaults to sender.")
    ),
  async execute(interaction, dynamo) {
    const userId = interaction.options.getUser("user")?.id || interaction.user.id;
    // await interaction.deferReply()
    // const user = await dynamo.get(userId);
    const user = dynamo.getCache(userId)
    console.log("[/time]{time}", user?.time);

    if (user == undefined)
      interaction.reply(`Uh Oh! ${await getNickname(interaction, userId)} cannot be found. Use \`/join\` to join the game`);
    else
      interaction.reply(`${user.name} has been tagged for ${parseTime(user.time)}`);
  },
};

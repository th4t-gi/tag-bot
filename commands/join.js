const { SlashCommandBuilder } = require("discord.js");
const { adminIds } = require("../config.json");
const { getNickname, updateStandings } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Adds a user to the Tag Game")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to be added. Defaults to sender.")
    )
    .addBooleanOption((option) =>
      option
        .setName("force")
        .setDescription(
          "Initializes user forcefully, will reset a user's time if already initiated."
        )
    ),

  async execute(interaction, dynamo) {
    const userId =
      interaction.options.getUser("user")?.id || interaction.user.id;
    // const user = await dynamo.get(userId)
    const user = dynamo.getCache(userId);
    const force = interaction.options.getBoolean("force") || false;

    if ((force && adminIds.includes(interaction.user.id)) || user?.id == undefined) {
      const name = await getNickname(interaction, userId);
      dynamo.set(userId, { time: 0, times_tagged: 0, name }).then(() => updateStandings(interaction, dynamo));

      if (force) interaction.reply(`Forcefuly initiated user ${name}`);
      else interaction.reply(`Initiated ${name}`);
    } else {
      interaction.reply(`${user.name} has already been initiated`);
    }
  },
};

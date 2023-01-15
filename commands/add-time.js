const { SlashCommandBuilder } = require("discord.js");
const { adminIds } = require("../config.json");
const { getNickname, parseTime } = require("../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-time")
    .setDescription("Adds time to a given user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to be add time to. Defaults to sender.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("seconds")
        .setDescription("Amount of time in seconds to add")
        .setRequired(true)
    ),
  async execute(interaction, dynamo) {
    // const db = new Keyv('sqlite://'+dbName);
    const userId = interaction.options.getUser("user").id;
    let time = interaction.options.getInteger("seconds") * 1000;
    const neg = time < 1;

    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!");
      return;
    }
    if (!userId) {
      const name = await getNickname(interaction, userId);
      interaction.reply(name + " cannot be found");
    } else {
      // console.log("Added time", time, user.time);
      // await interaction.deferReply()
      const user = dynamo.getCache(userId);
      interaction.reply(
        `Successfully ${neg ? "removed" : "added"} ${parseTime(time)} ${
          neg ? "from" : "to"
        } ${user.name}`
      );
      time += user.time;
      console.log("added %d to %d", time, user.time);
      dynamo.update(user.id, { time });
    }
  },
};

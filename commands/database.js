const { SlashCommandBuilder } = require("discord.js");
const { adminIds } = require("../config.json");
const { parseTime } = require("../utils");
const { AWSWrapper } = require("../aws-wrapper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("database")
    .setDescription("Prints database in json format")
    .addStringOption((option) =>
      option
        .setName("key")
        .setDescription("Returns specified key from database")
    ),
    // .addBooleanOption((option) =>
    //   option.setName("humanize").setDescription("Humanizes the time and ID's")
    // )
    // .addBooleanOption((option) =>
    //   option
    //     .setName("dev")
    //     .setDescription("Uses the dev database or not. Defaults to false")
    // ),
  async execute(interaction, dynamo) {
    const key = interaction.options.getString("key")
    //Filter out only Admins
    if (!adminIds.includes(interaction.user.id)) {
      interaction.reply("Sorry, but you can't use this command!");
      return;
    }
    if (process.env.DEV) {
      dynamo = new AWSWrapper("dev-tag-game", "id");
      console.log("dev-tag-game");
    } else {
      dynamo = new AWSWrapper("tag-game", "id");
    }

    if (key) {
      await interaction.deferReply()
      return interaction.editReply(`Here's the \`${key}\` key from the database: `+ "```json\n" + JSON.stringify(await dynamo.get(key)) + "```")
    } else {
      interaction.reply(
        "Here's the " + (process.env.DEV ? "dev" : "") + " database right now!"
      );
    }

    let data = {};

    //map user object to nickname/username and milisecond time to hh:mm:ss
    Object.values(await dynamo.scan()).forEach((v) => {
      if (v.id.length == 18) {
        data[v.name] = {
          time: parseTime(v.time),
          times_tagged: v.times_tagged,
          id: v.id,
        };
      } else {
        if (v.id == "current") v.last_tag = new Date(v.last_tag).toLocaleString();
        data[v.id] = v;
      }
    });

    interaction.channel.send(
      "```json\n" + JSON.stringify(data, null, 2) + "```"
    );
  },
};

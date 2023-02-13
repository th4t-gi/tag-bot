require("dotenv").config();
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActionRowBuilder,
  UserSelectMenuBuilder,
  ActivityType,
} = require("discord.js");
const { cooldown, tables } = require("./config.json");
const { parseTime, createTagButtonRow, updateStandings } = require("./utils");

const fs = require("node:fs");
const path = require("node:path");
const { AWSWrapper } = require("./aws-wrapper");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const dynamo = new AWSWrapper(
  process.env.DEV? tables[1] : tables[0],
  "id"
);
console.log("Connected to ", dynamo.table);
//Finds Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

//Ready Event
client.once(Events.ClientReady, (c) => {
  if (process.env.DEV)
    client.user.setActivity("the bot crash over and over", {
      type: ActivityType.Watching,
    });
  else client.user.setActivity("tag", { type: ActivityType.Playing });
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // await interaction.deferReply({ephemeral: true})
  //Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, dynamo);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
  //When someone clicks the "I tagged someone Button"
  if (interaction.isButton() && interaction.customId == "tag_button") {

    const curr = dynamo.getCache("current");
    const user = dynamo.getCache(curr.user_id);
    const time = Date.now() - curr.last_tag;
    console.log("time", time);

    if (interaction.message.id !== curr.last_tag_msg) {
      return interaction.reply(
        "This is an old button, there should be a newer one!"
      );
    }

    // const cooldown = 15*60*1000

    //Filters out if the user isn't "it" and the cooldown
    if (curr.user_id !== interaction.user.id) {
      return interaction.reply({
        content:
          "You can't tag someone right now you silly goose! You are not it!\nIf you are actually it and the dumdum that tagged you selected the wrong person, use the `/set-tagged` command and use the button again.",
        ephemeral: true,
      });
    } else if (user == undefined) {
      return interaction.reply({
        content: `Uh Oh! You cannot be found <@${interaction.user.id}>! To join the game, use \`/join\`.`,
        ephemeral: true,
      });
    } else if (time < cooldown) {
      return interaction.reply({
        content: `Not yet you impatient fuck! You need to wait for ${parseTime(
          cooldown - time
        )}`,
        ephemeral: true,
      });
    } else {
      //creates Dropdown Menue
      const userSelect = new ActionRowBuilder().addComponents(
        new UserSelectMenuBuilder()
          .setCustomId("userSelect")
          .setPlaceholder("Nothing selected")
          .setMaxValues(1)
      );
      await interaction.reply({
        content: `Who did you tag ${user.name}? It's okay, you can tell me`,
        ephemeral: true,
        components: [userSelect],
      });
      console.log("[tagging_button]");
    }
  }
  //When the user selects who they tagged
  if (interaction.isUserSelectMenu() && interaction.customId == "userSelect") {
    if (interaction.user.id !== dynamo.getCache("current").user_id) {
      return interaction.reply({content: "You already tagged someone dummy!", ephemeral: true})
    }
    console.log(interaction.user.id, dynamo.getCache("current").user_id)
    await interaction.reply(`<@${interaction.user.id}> has tagged someone!`);
    const curr = await dynamo.get("current");
    const milliseconds = Date.now() - curr.last_tag;
    console.log("[userSelect] - time added", milliseconds);

    //Updates user's time
    dynamo
      .get(interaction.user.id)
      .then((user) => {
        user.times_tagged += 1;
        user.time += milliseconds;
        dynamo.set(interaction.user.id, user);
      })
      .finally(async () => {
        await dynamo.updateCache()
        updateStandings(interaction, dynamo);
      });

    dynamo.update("current", {
      last_tag: Date.now(),
      user_id: interaction.users.first().id,
    });
    interaction.channel.messages
      .fetch(curr.last_tag_msg)
      .then((m) => m.delete())
      .finally(() => {
        // interaction.deleteReply();
        interaction
          .followUp({
            content: "Let the glorious game of Tag continue!",
            components: [createTagButtonRow()],
          })
          .then((msg) => {
            dynamo.update("current", { last_tag_msg: msg.id });
          });
      });

    // dynamo.set("current", interaction.users.first().id)
    // dynamo.set("last_tag", Date.now())
    // dynamo.get("last_tag_msg").then(async msgId => {
    // 	(await interaction.channel.messages.fetch(msgId)).delete()
    // })
  }

  dynamo.updateCache();
});

process.on("unhandledRejection", async (error) => {
  console.error("Unhandled promise rejection:", error);
  const botChannel = await client.channels.fetch("1060038702837014628");
  botChannel.send("An error just occurred:\n" + error.message);
});

// client.on(Events.Error, })

client.login(process.env.DISCORD_TOKEN);

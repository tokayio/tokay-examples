const {
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} = require('discord.js');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN is missing. Set the Project Secret before deploying this bot.');
  process.exit(1);
}

const startedAt = new Date();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = [
  new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('See how long Campfire has been awake'),
  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the campfire a question')
    .addStringOption(option => option.setName('question').setDescription('What is on your mind?').setRequired(true)),
  new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll one familiar die')
    .addStringOption(option => option
      .setName('die')
      .setDescription('Choose a die')
      .addChoices(
        { name: 'd4', value: 'd4' },
        { name: 'd6', value: 'd6' },
        { name: 'd8', value: 'd8' },
        { name: 'd10', value: 'd10' },
        { name: 'd12', value: 'd12' },
        { name: 'd20', value: 'd20' },
        { name: 'd100', value: 'd100' },
      )),
].map(command => command.toJSON());

const answers = [
  'The sparks say yes.',
  'Give it one more night.',
  'Yes, and bring snacks.',
  'The smoke is undecided.',
  'Not this time. Keep the good idea nearby.',
  'Ask again after a brave first step.',
  'Absolutely. The kettle is already on.',
  'The logs crackled no.',
];

const duration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return [days && `${days}d`, hours && `${hours}h`, `${minutes}m`].filter(Boolean).join(' ');
};

const registerGuild = async (guild) => {
  await guild.commands.set(commands);
  console.log(`Registered ${commands.length} commands in ${guild.name}.`);
};

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Campfire ready as ${readyClient.user.tag}.`);
  await Promise.all(readyClient.guilds.cache.map(registerGuild));
  if (readyClient.guilds.cache.size === 0) {
    await readyClient.application.commands.set(commands);
    console.log('Registered global commands. Install the app in a server to use it there.');
  }

  if (process.env.DEV_CRASH === '1') {
    console.warn('DEV_CRASH is set. Throwing the requested proof crash in five seconds.');
    setTimeout(() => { throw new Error('Requested DEV_CRASH proof'); }, 5000);
  }
});

client.on(Events.GuildCreate, guild => {
  registerGuild(guild).catch(error => console.error(`Could not register commands in ${guild.name}.`, error.message));
});
client.on(Events.ShardReconnecting, shardId => console.log(`Discord shard ${shardId} reconnecting.`));
client.on(Events.ShardResume, (shardId, replayed) => console.log(`Discord shard ${shardId} resumed after replaying ${replayed} event(s).`));
client.on(Events.Error, error => console.error('Discord client error.', error.message));

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'uptime') {
    await interaction.reply(`Campfire has been awake for ${duration(Date.now() - startedAt.getTime())}. On Tokay since ${startedAt.toISOString()}.`);
    return;
  }
  if (interaction.commandName === '8ball') {
    await interaction.reply(answers[Math.floor(Math.random() * answers.length)]);
    return;
  }
  if (interaction.commandName === 'roll') {
    const die = interaction.options.getString('die') || 'd20';
    const sides = Number(die.slice(1));
    const result = Math.floor(Math.random() * sides) + 1;
    await interaction.reply(`You rolled **${result}** on a ${die}.`);
  }
});

client.login(token).catch((error) => {
  console.error('Discord login failed. Check the DISCORD_TOKEN Project Secret.', error.message);
  process.exit(1);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing the Discord connection.`);
  client.destroy();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const { App } = require("@slack/bolt");

const botToken = process.env.SLACK_BOT_TOKEN?.trim();
const appToken = process.env.SLACK_APP_TOKEN?.trim();
if (!botToken || !appToken) {
  console.error("SLACK_BOT_TOKEN and SLACK_APP_TOKEN are required. Add both Project Secrets before Go Live.");
  process.exit(1);
}

const startedAt = Date.now();
const app = new App({
  token: botToken,
  appToken,
  socketMode: true,
});

function uptime() {
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return [days && `${days}d`, hours && `${hours}h`, `${minutes}m`].filter(Boolean).join(" ");
}

app.event("app_mention", async ({ event, say }) => {
  await say({
    thread_ts: event.ts,
    text: "I can post a concise team update with `/standup your update` and show my connection age with `/botuptime`.",
  });
});

app.command("/standup", async ({ command, ack, respond }) => {
  await ack();
  const update = command.text.trim();
  if (!update) {
    await respond({ response_type: "ephemeral", text: "Add one useful line after `/standup` and I will post it here." });
    return;
  }
  await respond({
    response_type: "in_channel",
    text: `*Standup from <@${command.user_id}>*\n${update}`,
  });
  console.log(JSON.stringify({ event: "standup.posted", channel: command.channel_id, user: command.user_id }));
});

app.command("/botuptime", async ({ ack, respond }) => {
  await ack();
  await respond({ response_type: "ephemeral", text: `Connected for ${uptime()}.` });
});

async function stop(signal) {
  console.log(`Received ${signal}. Closing the Slack connection.`);
  await app.stop();
  process.exit(0);
}

process.on("SIGTERM", () => void stop("SIGTERM"));
process.on("SIGINT", () => void stop("SIGINT"));

(async () => {
  try {
    await app.start();
    console.log("Slack Socket Mode connected. Standup bot is ready.");
  } catch (error) {
    console.error(`Slack connection failed. Check both tokens and reinstall the app if its scopes changed. ${error.message}`);
    process.exit(1);
  }
})();

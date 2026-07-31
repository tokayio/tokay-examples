# Node Discord bot

A Discord bot answers uptime questions, rolls familiar dice, and gives playful `8ball` replies inside a server you manage. Tokay keeps its outbound Discord connection running as a Background Worker with logs beside the Service.

This is the useful shape for a bot that waits on a provider connection instead of serving a web page. You bring a Discord bot token, and Tokay keeps the process alive and makes connection failures visible.

## Guide and download

Read the full guide at https://tokay.io/examples/node-discord-bot. You can also
download the complete project at
https://tokay.io/examples/downloads/node-discord-bot.zip.

## What it does

Once **Logs** shows `Campfire ready`, the bot registers three slash commands in your Discord server.

Use `/uptime` to see when the current process started. Ask `/8ball` a question for a random campfire answer, or choose a die from d4 through d100 with `/roll`.

When the Worker restarts, Discord reconnects and the commands register again. The next uptime response reflects the new process.

## Set up Discord first

Create the bot in Discord before you deploy it. You will receive one token that lets this app connect to your server. Keep that token out of this folder and out of chat.

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and choose **New Application**.
2. Name the app, create it, then open **Bot** in the left sidebar.
3. Under **Token**, choose **Reset Token** and copy the value. Discord only shows it once.
4. Open **Installation**. Under **Install Link**, keep **Discord Provided Link**.
5. Under **Default Install Settings** for Guild Install, add the `applications.commands` and `bot` scopes. Give the bot **Send Messages** permission.
6. Copy the install link, open it, choose **Add to server**, and select a test server you manage.

These commands do not need privileged intents. If a Discord screen looks different, the [official Discord guide](https://docs.discord.com/developers/quick-start/getting-started) covers the current token and installation flow.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask the agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token and the Discord bot token in its secret store, start at step 3.

1. In Tokay, open **Account**, then **API**, and choose **New Token**.
2. Save the Tokay token and Discord bot token in your agent's secret store.
3. Give your agent this folder or its GitHub URL.
4. Point the agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask the agent to deploy the bot as a Background Worker, store `DISCORD_TOKEN` as a shared Project Secret, and confirm that `Campfire ready` appears in the logs.

The Tokay token lets the agent deploy. The Discord token lets the running bot connect. Never put either one in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `bot.js` and `package.json`, then choose **Analyze**.
3. Tokay detects one Background Worker. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Add the Discord token using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Background Worker and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Add the Discord token using the steps below.

## Add the Discord token

Open **Environment** and find `DISCORD_TOKEN` under **From your code**. Choose **Set shared value**, paste the bot token, and save it.

When the row says **Good to go**, follow the deployment tracker and choose **Go Live** if that action appears. The Background Worker has no public page. **Logs** will show when the bot is connected.

## Try it

1. Wait for `Campfire ready` in **Logs**, then run `/roll die: d20` in Discord.
2. Run `/uptime` and note the reported start time.
3. Restart the Worker and ask again. The command returns after reconnection with a new start time.

If the token is wrong, **Logs** shows a direct Discord login error. Tokay restarts the Background Worker and makes the repeated failure visible as an incident. Replace `DISCORD_TOKEN` with a valid value and the bot will reconnect.

## How it works

You do not need a public callback URL because `discord.js` opens one outbound gateway connection. The ready event registers the commands for every installed server.

Tokay sends shutdown signals during a deployment, and the bot closes its Discord client cleanly. Reconnects, errors, and command registration remain visible in **Logs** when you need to trace a problem.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `DISCORD_TOKEN` | Yes | Authenticates this bot with Discord. Save it under the Project's encrypted Secrets. |

## Grow from here

Try the [statement generator](../node-express-bullmq-redis-statement-generator) when you want an always running worker that pulls saved jobs from Redis.

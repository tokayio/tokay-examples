# Node Slack bot

A Slack standup bot posts team updates, explains its commands when mentioned, and reports how long its current connection has been open. Tokay keeps it connected as one Background Worker.

This project fits a workplace bot that listens over Slack Socket Mode instead of exposing a public endpoint. Tokay runs the long lived process and keeps the connection logs close to its Secrets.

## Guide and download

Read the full guide at https://tokay.io/examples/node-slack-bot. You can also download
the complete project at https://tokay.io/examples/downloads/node-slack-bot.zip.

## What it does

Mention the bot in a channel and it replies in a thread with a short guide to its two commands.

Enter `/standup` followed by an update and the bot posts it to the channel under your Slack identity. An empty update stays private and asks you to add one useful line.

Use `/botuptime` for a private response showing the age of the current Socket Mode connection.

## Create the Slack app

Create and install the Slack app before deploying the bot. This usually takes about two minutes.

1. Open [Your Apps](https://api.slack.com/apps) and choose **Create New App**.
2. Choose **From an app manifest**, select your workspace, and paste this repository's `manifest.json` into the JSON editor.
3. Choose **Next**, review the permissions, then choose **Create**.
4. Open **Install App** and choose **Install to Workspace**, then **Allow**.
5. Copy the **Bot User OAuth Token** that begins with `xoxb`. Keep it ready for `SLACK_BOT_TOKEN` in the deployment steps below.
6. Open **Basic Information**. Under **App-Level Tokens**, choose **Generate Token and Scopes**.
7. Name the token, add the `connections:write` scope, and choose **Generate**.
8. Copy the token that begins with `xapp`. Keep it ready for `SLACK_APP_TOKEN` in the deployment steps below.

Keep both tokens out of this folder and out of chat.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask the agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token and both Slack tokens in its secret store, start at step 3.

1. In Tokay, open **Account**, then **API**, and choose **New Token**.
2. Save the Tokay token, `SLACK_BOT_TOKEN`, and `SLACK_APP_TOKEN` in the agent's secret store.
3. Give your agent this folder or its GitHub URL.
4. Point the agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask the agent to deploy the bot as a Background Worker, store both Slack tokens as shared Project Secrets, and confirm that the ready message appears in the logs.

The Tokay token lets the agent deploy. The two Slack tokens let the running bot connect. Never put any of them in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Background Worker. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Add both Slack tokens using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Background Worker and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Add both Slack tokens using the steps below.

## Add the Slack tokens

Open **Environment** and find `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN` under **From your code**. Choose **Set shared value** for each one, paste the matching token, and save it.

When both rows say **Good to go**, follow the deployment tracker and choose **Go Live** if that action appears. The Background Worker has no public page. **Logs** will show when the bot is connected.

## Try it

1. Invite `@Standup Pocket` to a test channel and mention it for help.
2. Enter `/standup Shipped the export flow and reviewing production logs next`.
3. Run `/botuptime`, restart the Worker, then run it again. The shorter age proves the new process reconnected.

## What failure looks like

A missing token keeps the bot from going live. If a token is present but wrong, **Logs** shows a direct Slack connection error.

Tokay restarts the Background Worker and makes a repeated failure visible as an incident. Replace the invalid Project Secret and the bot will reconnect.

## How it works

You can use the bot without a public URL because Bolt keeps one outbound WebSocket open to Slack. Mentions and slash commands arrive on that connection, and replies go back through Slack's API.

During a deployment, Tokay gives the old process time to close its connection before the replacement takes over. A failed login remains in **Logs** instead of looking like a silent bot.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `SLACK_BOT_TOKEN` | Yes | Gives the installed bot its workspace permissions. |
| `SLACK_APP_TOKEN` | Yes | Opens Socket Mode with `connections:write`. |

## Grow from here

Try the [Discord bot](../node-discord-bot) when the conversation happens in a community server instead.

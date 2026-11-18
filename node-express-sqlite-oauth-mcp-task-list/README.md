# Remote MCP server with OAuth

A personal task inbox lets each visitor connect an MCP client, authorize with their email, and manage only their own saved tasks. Tokay runs the Express and SQLite app as one Web Service and supplies the OAuth layer around it.

Use it when real people should approve an AI client without sharing accounts or letting one visitor choose another person's data. Your app receives a verified identity and keeps its tool logic focused on tasks.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-express-sqlite-oauth-mcp-task-list. You can also
download the complete project at
https://tokay.io/examples/downloads/node-express-sqlite-oauth-mcp-task-list.zip.

## What it does

The landing page gives each visitor the Claude Code commands for connecting and signing in.

After consent, the MCP client can list, create, update, complete, reopen, and delete that visitor's tasks. Due dates and completion state stay with the same person through later sessions.

A second visitor uses the same endpoint but starts with an empty inbox. The app never accepts an email address as a tool argument, so the client cannot select someone else's account.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the app, restrict it to your email, connect to `/mcp` with OAuth, create a task, and prove a second visitor cannot see it.

This example uses two MCP connections. Tokay MCP is how your assistant deploys it. The task tools are a separate MCP server, and visitors reach them by signing in with OAuth.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, open the live URL.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, open the live URL.

## Turn on visitor OAuth

OAuth is automatic for Private Tokay apps. There are no client IDs, callback URLs, OAuth secrets, or environment variables to configure in this project.

1. Switch the Service from **Public** to **Private** with the control beside its name.
2. Open the **Access** tab. Under **Who can open it**, add the email of each visitor who should connect.

Private Services automatically publish the standard MCP metadata for protected resources and OAuth authorization servers. Each visitor signs in and approves their own connection. The builder does not mint a token on their behalf.

## Connect from Claude Code

Copy the live URL from the top of the Service page. Replace the placeholder below with that URL, then connect Claude Code.

```sh
export SERVICE_URL="https://your-service.tokay.app"
claude mcp add --transport http task-inbox "$SERVICE_URL/mcp"
claude mcp login task-inbox
```

Claude Code opens a browser. Enter an approved email, follow the magic link, and approve the connection. Then ask Claude to add a task.

If you add a second visitor, have them connect with their own email. Their list starts empty even though both people use the same MCP URL and SQLite database.

## Try it

1. Ask your client to add `Renew passport` with a due date next Friday.
2. Mark that task complete, then deploy the app again.
3. List completed tasks. Your passport reminder is still listed, while another visitor still sees only their own inbox.

## How OAuth identity reaches the app

You do not need to trust identity sent by the MCP tool call. Tokay's access layer publishes OAuth discovery, completes consent, validates the bearer token, removes it, and injects trusted identity headers only after authorization succeeds.

The app requires a human actor on every `/mcp` request. Every task query includes `X-Tokay-Actor-Id` as its owner key. Machine credentials and anonymous calls are rejected because this inbox belongs to individual people.

## Secrets

You have no OAuth secret to configure. Tokay owns authorization and passes verified visitor identity to the app.

## Grow from here

Use the [private sales analytics MCP server](../node-express-sqlite-mcp-orders) when your headless agent should connect as a Machine with their own credential instead of using a person's OAuth grant.

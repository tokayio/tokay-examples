# Deploy a remote MCP server with OAuth

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

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask your agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **Platform tokens**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the app, restrict it to your email, connect to `/mcp` with OAuth, create a task, and prove a second visitor cannot see it.

The Tokay API token manages the deployment. It is not the OAuth token used by MCP visitors. Never put it in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, open the live URL.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, open the live URL.

## Turn on visitor OAuth

OAuth is automatic for restricted Tokay apps. There are no client IDs, callback URLs, OAuth secrets, or environment variables to configure in this project.

1. Open the Project and choose **App audience**.
2. Under **Audience**, choose **Specific people**.
3. Under **Specific people**, add each outside visitor who should connect. Project admins already have access.
4. Choose **Save audience**, then confirm with **Save**.

Restricted Services automatically publish the standard MCP protected-resource metadata and OAuth authorization-server metadata. Each visitor signs in and approves their own connection. The builder does not mint a token on their behalf.

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
3. List completed tasks. Your passport reminder remains, while another visitor still sees only their own inbox.

## How OAuth identity reaches the app

You do not need to trust identity sent by the MCP tool call. Tokay's access layer publishes OAuth discovery, completes consent, validates the bearer token, removes it, and injects trusted identity headers only after authorization succeeds.

The app requires a human actor on every `/mcp` request. Every task query includes `X-Tokay-Actor-Id` as its owner key. Machine credentials and anonymous calls are rejected because this inbox belongs to individual people.

## Secrets

You have no OAuth secret to configure. Tokay owns authorization and passes verified visitor identity to the app.

## Grow from here

Use the [private sales analytics MCP server](../node-express-sqlite-mcp-orders) when your headless agent should connect as a Machine with their own credential instead of using a person's OAuth grant.

# Deploy me

A guestbook lets visitors leave their name and a note, then keeps every entry through refreshes and new deployments. Tokay runs it as one Web Service and preserves its SQLite data.

You can see the page, form handling, and storage in one small `server.js` file. Start here when you want to understand a complete app before moving to a framework or managed database.

## Guide and download

Read the full guide at https://tokay.io/examples/deploy-me. You can also download the
complete project at https://tokay.io/examples/downloads/deploy-me.zip.

## What it does

The page opens with a welcome entry and a form for your name and note.

Press **Sign the book** and your message appears at the top with its author and time. The entry count updates with it.

Leave either field blank and the page asks you to fill in both without losing what you already typed.

## Deploy with your agent

If your client supports remote MCP, connect it to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the browser sign in,
and ask your agent to deploy this folder without pasting a token. Otherwise,
follow the API token steps below.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **You**, then **API & MCP tokens**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the guestbook and confirm the page opens.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `server.js` and `package.json`, then choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to visit your guestbook.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Enter a repository name and choose **Create Repository**.
3. Follow the Git setup commands shown by Tokay, then push this folder.
4. After Tokay analyzes the files, choose the detected Web Service and a Project. Choose **Deploy**.
5. Continue the deployment and choose **Go Live** if prompted.
6. When the Service status says **Live**, click the live URL in the top section to visit your guestbook.

## Try it

1. Add your name and a note, then refresh the page.
2. Return to the Service page and deploy the same code again.
3. Open the live URL. Your note is still there because Tokay preserved the SQLite file.

## How it works

The server stores notes in a SQLite file under the persistent data directory Tokay supplies. The same file is available after the app restarts or you deploy new code.

Tokay also replicates persistent data beyond the app and takes periodic offsite snapshots. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) when you want the storage details.

## Secrets

This guestbook has no secret to configure. Tokay gives the app a persistent directory for its SQLite file.

## Grow from here

Try the [PostgreSQL task tracker](../node-express-postgres-task-tracker) when you want a larger app with tasks, filters, and an API.

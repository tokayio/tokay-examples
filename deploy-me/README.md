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

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask the agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **API**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or its GitHub URL.
4. Point the agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask the agent to deploy the guestbook and confirm the page opens.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `server.js` and `package.json`, then choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, click the live URL in the top section to visit your guestbook.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Enter a repository name and choose **Create Repository**.
3. Follow the Git setup commands shown by Tokay, then push this folder.
4. After Tokay analyzes the files, choose the detected Web Service and a Project. Choose **Deploy**.
5. Wait for the deployment to finish. If **Go Live** appears, choose it.
6. When the Service status says **Live**, click the live URL in the top section to visit your guestbook.

## Try it

1. Add your name and a note, then refresh the page.
2. Return to the Service page and deploy the same code again.
3. Open the live URL. Your note is still there because Tokay preserved the SQLite file.

## How it works

Want to see exactly what keeps the notes? The server writes them to a SQLite file under the persistent data directory Tokay supplies. The same file is available after the app restarts or you deploy new code.

Tokay also replicates persistent data beyond the app and takes periodic offsite snapshots. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) when you want the storage details.

## Secrets

This guestbook has no secret to configure. Tokay gives the app a persistent directory for its SQLite file.

## Grow from here

Try the [PostgreSQL task tracker](../node-express-postgres-task-tracker) when you want a larger app with tasks, filters, and an API.

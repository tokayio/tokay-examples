# Node Express API

A small Express API returns its Node.js version, reports its health, and lets you list or add todos. Tokay gives it a live URL as one Web Service.

This is the familiar Express shape many Node.js projects start with. You can deploy the ordinary server and `package.json` without teaching the app about Tokay.

## Guide and download

Read the full guide at https://tokay.io/examples/node-express-api. You can also
download the complete project at
https://tokay.io/examples/downloads/node-express-api.zip.

## What it does

Open the root route to see which Node.js runtime is serving your app.

The `/todos` route starts with three sample items. Send it a title with `POST` and the API returns the new todo with its ID.

Send an empty title and you get a clear validation error. The `/health` route gives you a small liveness check.

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
5. Ask your agent to deploy the API and confirm that `/health` returns `{"ok":true}`.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `server.js` and `package.json`, then choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, copy the live URL from the top section.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, copy the live URL from the top section.

## Try it

Replace the placeholder with your live URL, add one todo, then fetch the list.

```sh
export APP_URL="https://your-app.tokay.app"
curl -X POST "$APP_URL/todos" \
  -H 'Content-Type: application/json' \
  -d '{"title":"ship the next thing"}'
curl "$APP_URL/todos"
```

Your new todo appears in the list. Deploy again and the three samples return because this starter deliberately keeps data in memory.

## How it works

You can keep the same Express entry point you use locally. Tokay installs the packages, supplies `PORT`, starts the server, and routes the live URL to it.

## Secrets

You can call every route without a secret or an outside account.

## Grow from here

Try the [PostgreSQL task tracker](../node-express-postgres-task-tracker) when you want todos to survive a restart.

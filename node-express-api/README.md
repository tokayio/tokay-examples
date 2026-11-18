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

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the API and confirm that `/health` returns `{"ok":true}`.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `server.js` and `package.json`, then choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, copy the live URL from the top section.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
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

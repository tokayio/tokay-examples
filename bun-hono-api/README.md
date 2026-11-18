# Bun Hono API

A Hono todo API reports its Bun version, answers health checks, and supports listing or adding todos. Tokay recognizes the Bun project and runs it as one Web Service.

Bring the same TypeScript entry point, package file, and lockfile you use during development. Tokay keeps Bun as the runtime instead of translating the app to Node.js.

## Guide and download

Read the full guide at https://tokay.io/examples/bun-hono-api. You can also download
the complete project at https://tokay.io/examples/downloads/bun-hono-api.zip.

## What it does

The root response shows the Bun version currently serving your API.

Fetch `/todos` for three sample tasks. Post a nonempty title and Hono returns the new item with a `201` status. Empty input receives a `400` response.

The `/health` route gives you a direct liveness check.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the API and confirm that the root response includes the Bun version.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `index.ts`, `package.json`, and `bun.lock`, then choose **Analyze**.
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

Create a todo at your live URL, then make sure the next list response contains it.

```sh
export APP_URL="https://your-app.tokay.app"
curl -X POST "$APP_URL/todos" \
  -H 'Content-Type: application/json' \
  -d '{"title":"ship the next thing"}'
curl "$APP_URL/todos"
```

The item appears while this instance is running. Deploy again and the list returns to its three samples because the starter does not include durable storage.

## How it works

You can keep Hono's fetch style handler and Bun start command. Tokay installs from the lockfile, provides `PORT`, and launches the TypeScript app with Bun.

## Secrets

You have no secrets to add. The example talks only to its callers.

## Grow from here

Browse the [Tokay examples catalog](..) when you want saved data or more than one Service.

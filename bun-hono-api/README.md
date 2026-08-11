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
5. Ask your agent to deploy the API and confirm that the root response includes the Bun version.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `index.ts`, `package.json`, and `bun.lock`, then choose **Analyze**.
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

# Rust Axum API

An Axum todo API exposes health, runtime, list, and create routes from a compact Rust project. Tokay builds the source and serves it at a live URL as one Web Service.

This example deploys a Tokio and Axum Service from the same Cargo files used locally. Tokay builds the Cargo project in release mode, supplies `PORT`, and starts the Axum server.

## Guide and download

Read the full guide at https://tokay.io/examples/rust-axum-api. You can also download
the complete project at https://tokay.io/examples/downloads/rust-axum-api.zip.

## What it does

Open the root route and the API identifies itself as the Rust service.

Request `/todos` for the three sample tasks. Post a title to add another item. A blank title receives a validation error and leaves the list unchanged.

The `/health` route gives monitors a small JSON response.

## Deploy with your agent

If your client supports remote MCP, connect it to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the browser sign in,
and ask your agent to deploy this folder without pasting a token. Otherwise,
follow the API token steps below.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **You**, then **API & MCP tokens**, and choose **New token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the API and confirm that `/health` returns `{"ok":true}`.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `Cargo.toml` and `src/main.rs`, then choose **Analyze**.
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

Send one write to your deployed API, then read the collection back.

```sh
export APP_URL="https://your-app.tokay.app"
curl -X POST "$APP_URL/todos" \
  -H 'Content-Type: application/json' \
  -d '{"title":"ship the next thing"}'
curl "$APP_URL/todos"
```

The list now contains your title. A later deployment starts from the samples again, which makes the boundary between process memory and durable storage easy to see.

## How it works

You only bring the Cargo project. Tokay compiles the release, supplies `PORT`, and starts the Axum listener while your Tokio and Serde code is unchanged.

## Secrets

The service needs no secrets. All four routes are available without an outside account.

## Grow from here

Browse the [Tokay examples catalog](..) when you want saved data or a Background Worker.

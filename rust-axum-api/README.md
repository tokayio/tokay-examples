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

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the API and confirm that `/health` returns `{"ok":true}`.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `Cargo.toml` and `src/main.rs`, then choose **Analyze**.
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

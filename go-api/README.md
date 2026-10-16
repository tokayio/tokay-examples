# Go API

A Go API built with `net/http` reports its runtime, answers health checks, and lets you list or add todos. Tokay compiles the source and runs the binary as one Web Service.

The project is intentionally close to what you would write for any Go host. You keep the standard library server and Tokay handles the build and live routing.

## Guide and download

Read the full guide at https://tokay.io/examples/go-api. You can also download the
complete project at https://tokay.io/examples/downloads/go-api.zip.

## What it does

The root route tells you which Go runtime compiled the service.

Fetch `/todos` to see three starting tasks. Post a JSON title and the API adds it with the next ID. Malformed JSON, unknown fields, and blank titles receive a helpful `400` response.

Use `/health` when you need a simple check that the process is answering requests.

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
2. Upload `main.go` and `go.mod`, then choose **Analyze**.
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

Point the commands at your live URL and prove that a write appears in the next read.

```sh
export APP_URL="https://your-app.tokay.app"
curl -X POST "$APP_URL/todos" \
  -H 'Content-Type: application/json' \
  -d '{"title":"ship the next thing"}'
curl "$APP_URL/todos"
```

The list includes the new title while this process is running. A fresh deployment resets it to the sample data because storage is deliberately outside this starter.

## How it works

You do not need to ship a compiled artifact. Tokay detects the Go module from `go.mod`, builds `main.go`, supplies the port, and starts the program.

## Secrets

There are no secrets to configure. The API has no outside dependencies.

## Grow from here

Browse the [Tokay examples catalog](..) when you want saved data or background work.

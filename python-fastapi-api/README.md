# Python FastAPI API

A FastAPI todo service gives you generated API docs, request validation, a health check, and routes for listing or adding todos. Tokay runs it at a live URL as one Web Service.

This example matches a normal FastAPI project. Tokay analyzes the source and `requirements.txt` to detect the FastAPI start command and dependencies.

## Guide and download

Read the full guide at https://tokay.io/examples/python-fastapi-api. You can also
download the complete project at
https://tokay.io/examples/downloads/python-fastapi-api.zip.

## What it does

Open `/docs` to explore every route and send requests from FastAPI's interactive page.

The todo list begins with three samples. Add a nonempty title and the API returns a new item. Empty or oversized titles are rejected before they reach the list.

The root response shows the Python version. `/health` returns a compact liveness result.

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
2. Upload `main.py` and `requirements.txt`, then choose **Analyze**.
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

Set your live URL, create one todo, then confirm FastAPI saved it in the running process.

```sh
export APP_URL="https://your-app.tokay.app"
curl -X POST "$APP_URL/todos" \
  -H 'Content-Type: application/json' \
  -d '{"title":"ship the next thing"}'
curl "$APP_URL/todos"
```

The response list now includes your todo. Restart or deploy again and the samples return because this small starter has no database.

## How it works

FastAPI and Pydantic generate the API docs and validation from the route and model definitions in `main.py`. Tokay installs the requirements and starts the app without changing its structure.

## Secrets

This starter has no secrets. Every endpoint is ready to try after deployment.

## Grow from here

Try the [AI research queue](../python-fastapi-postgres-ai-research-queue) when your FastAPI app needs saved jobs and a Background Worker.

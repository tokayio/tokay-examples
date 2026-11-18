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

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the API and confirm that `/health` returns `{"ok":true}`.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

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

# Node Express PostgreSQL task tracker

A food truck launch board keeps permits, kitchen work, and marketing tasks moving in one place. Tokay runs the Express app as a Web Service with PostgreSQL, so every update survives the next deployment.

This project shows the shape of an app that has grown beyond a starter API. You get a browser interface and JSON routes over the same validated data, with the database schema committed beside the server.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-express-postgres-task-tracker. You can also download
the complete project at
https://tokay.io/examples/downloads/node-express-postgres-task-tracker.zip.

## What it does

The board opens with launch tasks grouped across permits, kitchen work, and marketing.

Use **Every team**, **Every status**, or the search box to focus the list. Press **Move forward** to take a task from todo to doing, then to done.

The form adds a dated task to one of the three teams. Tasks you create also get a **Remove** button, while the starting examples stay available as useful reference work.

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
5. Ask your agent to deploy the task tracker, confirm the suggested PostgreSQL database, and prove that a new task survives another deployment.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Finish setup in Tokay

The task tracker needs PostgreSQL to save your work. Tokay has already prepared the database setup based on the app. You only need to confirm where its `DATABASE_URL` should point.

1. Open the Service and choose **Environment**.
2. Under **From your infrastructure**, find `DATABASE_URL`.
3. Choose **Confirm database**.
4. Keep the suggested `app` name.
5. Choose **Confirm**.

The task tracker has everything it needs once its Service is connected to the `app` database. Tokay tests the committed database migration against a copy before the app receives traffic. Choose **Go Live** if prompted, then open the live URL to see the board.

## Try it

1. Move a kitchen task forward in the browser.
2. Replace the placeholder with your live URL and add another task through the API.

```sh
export APP_URL="https://your-app.tokay.app"
curl -X POST "$APP_URL/api/tasks" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Order compostable bowls","tag":"kitchen","dueDate":"2026-08-10","status":"todo"}'
```

3. Refresh the board, then deploy again. Both changes remain because the page and API share PostgreSQL.

## How it works

The page and API use the same Express server and PostgreSQL tables. The server rejects invalid titles, dates, statuses, and filters before a write reaches the database.

The schema lives in a Graphile Migrate file beside the app. Tokay rehearses that migration against a copy before applying it, then the server adds any missing starter tasks after the tables are ready.

## Secrets

You do not need to provide a secret. Tokay supplies `DATABASE_URL` from the managed PostgreSQL database you confirm.

## Grow from here

Try the [React watchlist](../node-vite-react-express-postgres-watchlist) when you want the same database setup behind a Vite interface.

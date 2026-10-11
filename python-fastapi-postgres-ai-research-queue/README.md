# Python FastAPI PostgreSQL AI research queue

A research queue turns a question into saved evidence notes and a finished brief while the browser watches each step. Tokay runs the FastAPI page and Background Worker together, and PostgreSQL lets interrupted jobs resume from their latest checkpoint.

You can prove the queue and recovery path without paying for a model. Three bundled documents drive the default demo, and an optional Anthropic key upgrades the same workflow to model generated notes and synthesis.

## Guide and download

Read the full guide at
https://tokay.io/examples/python-fastapi-postgres-ai-research-queue. You can also
download the complete project at
https://tokay.io/examples/downloads/python-fastapi-postgres-ai-research-queue.zip.

## What it does

The page starts with a completed heat pump brief so you can see the shape of a finished result.

Enter a research question and press **Start research**. The job moves through reading documents, building evidence notes, drafting the synthesis, and saving the result while the page updates live.

Check **Restart the worker once during this job** to watch recovery happen on purpose. The replacement process continues after the saved second step instead of repeating the job from the beginning.

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
5. Ask your agent to deploy exactly one Web Service and one Background Worker, connect both to the same `app` PostgreSQL database, and verify that only the Web Service owns the Alembic migration.

If you want real model synthesis, save your Anthropic key in your agent's secret store too and ask your agent to set `ANTHROPIC_API_KEY` as a shared Project Secret. Never put either credential in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**. Tokay detects exactly one Web Service in `web` and one Background Worker in `worker`.
3. Select both candidates, choose one Project, then choose **Deploy 2 Services**.
4. Open each Service's **Environment** page. Under **From your databases**, find `DATABASE_URL`, choose **Confirm database**, keep `app`, then choose **Confirm**. Do this for both Services so the page and worker use the same jobs and checkpoints.
5. Check that only the Web Service shows the Alembic migration. This keeps the database change from running twice.
6. Continue the deployment and choose **Go Live** if prompted. When the Web Service is live, open the research queue from its URL.

## Push with Git

1. Choose **Add code**, then **Git**.
2. Create a repository, follow the Git setup commands shown by Tokay, and push this whole folder.
3. Select both detected candidates, choose one Project, then choose **Deploy 2 Services**.
4. Confirm the `app` database on both Services and check that only the Web Service shows the Alembic migration.
5. Continue the deployment and choose **Go Live** if prompted. Open the research queue from the Web Service's live URL.

## Try it

1. Submit the provided heat pump question and wait for its four steps to finish.
2. Run it again with **Restart the worker once during this job** checked. Confirm that a later attempt resumes after step two.
3. Deploy both Services again. The completed briefs and recovery evidence remain in PostgreSQL.

## Add real model synthesis

Open the Background Worker's **Environment** page and find `ANTHROPIC_API_KEY` under **From your code**. Choose **Set value**, paste your key, and save it. Deploy the Background Worker again.

New jobs now call Anthropic once for each bundled document and once for the final synthesis. The result badge changes to **Anthropic**. The page keeps showing saved progress while those model calls run.

## How it works

You avoid competing schema changes because the Web Service owns the Alembic migration for both processes. The Background Worker connects to those tables without trying to apply it again.

Each claimed job has a short lease that the worker renews while saving progress. If the process disappears, the lease expires and another worker continues from the checkpoint. `FOR UPDATE SKIP LOCKED` prevents two live workers from claiming the same job.

The queue retries a temporary failure up to three times. SSE updates the page without a refresh, while PostgreSQL is the source of truth if that browser connection closes.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Turns the bundled document demo into model synthesis with several calls. Keep the key in encrypted Project storage. |

## Grow from here

Try the [PostgreSQL task tracker](../node-express-postgres-task-tracker) when you want a smaller starting point for migrations and saved CRUD data.

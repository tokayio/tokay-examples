# Node Express BullMQ Redis statement generator

A statement desk turns up to 200 customer balance rows into individual PDFs and one downloadable ZIP while showing live progress. Tokay runs the upload page and BullMQ worker separately over one managed Redis resource.

This is the pattern to use when a request should start substantial work without making the visitor wait on one web process. Redis carries the queue, progress, CSV, and temporary PDFs between both Services.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-express-bullmq-redis-statement-generator. You can also
download the complete project at
https://tokay.io/examples/downloads/node-express-bullmq-redis-statement-generator.zip.

## What it does

The page offers a 40 row sample CSV and accepts your own file with customer, email, period, and balance columns.

Press **Generate statements** and the current batch counter advances as the Worker finishes each PDF. Completed names become individual download links, and **Download all PDFs** appears when the full batch is ready.

The desk keeps the newest eight completed batches. A ninth removes the oldest temporary source and output files from Redis.

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
5. Ask your agent to deploy both candidates in one Project, confirm that they share one Redis resource, upload the sample CSV, and wait until every PDF is ready.

Never put the Tokay API token in this folder or in either deployed Service.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**. Tokay detects a Web Service in `web` and a Background Worker in `worker`.
3. Select both candidates, choose one Project, then choose **Deploy 2 Services**.
4. Open each Service's **Environment** page and verify that both use the same managed Redis resource for `REDIS_URL`.
5. Continue the deployment and choose **Go Live** if prompted.

## Push with Git

1. Choose **Add code**, then **Git**.
2. Create a repository, follow the Git setup commands shown by Tokay, and push this folder.
3. Select both detected candidates, choose one Project, then choose **Deploy 2 Services**.
4. Verify that both Services use the same managed Redis resource for `REDIS_URL`, then continue the deployment. Choose **Go Live** if prompted, then open the statement desk from the Web Service's live URL.

## Try it

1. Download the sample CSV, upload it, and watch the counter reach 40.
2. Open one customer statement and confirm that the balance appears in a valid PDF.
3. Download the ZIP and check that it contains all 40 named statement files.

## Watch recovery

Start a larger batch, then stop the Background Worker while it is moving. Tokay restarts the process, and BullMQ returns the interrupted job to the queue. Watch the page continue from where the batch left off.

This learning app keeps the newest eight batches. Creating a ninth removes the oldest CSV and PDFs from Redis, so do not use the example as a permanent statement archive.

## How it works

You keep the page responsive because the Web Service validates the CSV and adds one BullMQ job per customer instead of rendering PDFs itself. The Worker processes two at a time and saves each result to Redis with an idempotent completion marker.

The page polls batch metadata and serves individual files or a streamed ZIP. When statements become business records, move them to permanent object storage rather than stretching this intentionally short Redis history.

## Secrets

Neither Service needs a secret from you. Tokay supplies the same private `REDIS_URL` to both of them.

## Grow from here

Try the [WebSocket chat](../node-websocket-chat) when a long running process should coordinate connected browsers instead of queued work.

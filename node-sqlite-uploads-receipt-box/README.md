# Node SQLite uploads receipt box

A receipt box keeps each uploaded image with its merchant, amount, category, and purchase date, then totals the selected month. Tokay runs it as one Web Service and preserves both the SQLite records and image files.

This shape works well when your app naturally treats a small database and local uploads as one unit. You can keep that simple layout while Tokay gives the directory a durable home.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-sqlite-uploads-receipt-box. You can also download the
complete project at
https://tokay.io/examples/downloads/node-sqlite-uploads-receipt-box.zip.

## What it does

The page begins with two sample receipts and shows their combined amount for the current month.

Use **Add a receipt** to save a merchant, amount, category, date, and JPEG, PNG, or WebP image. The new card links to the full upload.

Choose another month and press **Show month** to see only that period's receipts and total.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask the agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **API**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or its GitHub URL.
4. Point the agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask the agent to deploy the receipt box, add one receipt with an image, and confirm that both survive another deployment.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, click the live URL in the top section to open the receipt box.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, click the live URL in the top section to open the receipt box.

## Try it

1. Add a receipt with your own image and open its thumbnail at full size.
2. Note the monthly total, then deploy the same code again.
3. Return to that month. The record, total, and uploaded image remain together.

The two sample receipt illustrations are original assets dedicated to CC0 1.0 Universal.

## How it works

You can follow the data without crossing systems. SQLite records what you bought, and the uploads directory keeps the matching image under the same persistent root.

The server checks file type and enforces a 3 MB limit before saving an upload. Tokay replicates the resulting data beyond the app and takes periodic offsite snapshots. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) for details.

## Secrets

There are no secrets to add. SQLite and the uploaded images use Tokay's persistent storage.

## Grow from here

Try the [Prisma migrations walkthrough](../node-prisma-migrations-walkthrough) when you want PostgreSQL and reviewed schema changes.

# Python PostgreSQL daily sales report

A daily sales desk shows yesterday's revenue, order count, weekly change, and leading products beside an archive of earlier reports. Tokay runs the generator every morning and keeps the Flask viewer live as a Web Service.

The two Python entry points share one PostgreSQL database, which is a useful shape when scheduled work creates something people return to later. Ninety days of fictional orders make the first report meaningful without another account.

## Guide and download

Read the full guide at
https://tokay.io/examples/python-postgres-daily-sales-report. You can also download
the complete project at
https://tokay.io/examples/downloads/python-postgres-daily-sales-report.zip.

## What it does

The viewer opens with a clear prompt when no report has run yet.

After the generator finishes, the latest report shows revenue, orders, change from the prior week, and the three products that earned the most. **Report history** links back through earlier dates.

Run the same reporting date again and the existing report refreshes instead of producing a duplicate.

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
5. Ask your agent to deploy both candidates in one Project, connect both to the same `app` PostgreSQL database, schedule the generator for 8am in your timezone, and verify one report in the viewer.

Never put the Tokay API token in this folder or in either deployed Service.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**. Tokay detects a Web Service in `viewer` and a Scheduled Service in `generator`.
3. Enter `every day at 8am` in the generator's **Schedule** field, then check the upcoming runs and timezone.
4. Select both candidates, choose one Project, then choose **Deploy 2 Services**.
5. Open each Service's **Environment** page. Under **From your databases**, find `DATABASE_URL`, choose **Confirm database**, keep `app`, then choose **Confirm**. Do this for both Services so the generator and viewer share the same reports.
6. Check that only the viewer shows the Alembic migration, then continue the deployment and choose **Go Live** if prompted. When the viewer is live, open it from its URL.

## Push with Git

1. Choose **Add code**, then **Git**.
2. Create a repository, follow the Git setup commands shown by Tokay, and push this folder.
3. Set the generator schedule to `every day at 8am` and check the upcoming runs in your timezone.
4. Select both detected candidates, choose one Project, then choose **Deploy 2 Services**.
5. Connect both Services to the `app` database, then continue the deployment. Choose **Go Live** if prompted, then open the viewer from its live URL.

## Try it

1. Open the generator Service and choose **Run Now**.
2. Refresh the viewer and open yesterday's report from **Report history**.
3. Run the generator again. The same dated report gets a new generated time rather than a duplicate row.

## How it works

You only need one schema owner. The viewer applies the Alembic migration and seeds fictional orders, while the generator reads those tables, calculates its reporting windows, saves one dated result, and exits.

Tokay starts that short process on schedule and keeps every run result. If the calculation fails, the error stays attached to the run instead of disappearing into a long lived server log.

## Secrets

You do not need to add a secret. Tokay supplies the shared `DATABASE_URL` to both Services.

## Grow from here

Try the [uptime monitor](../python-uptime-monitor) when a scheduled job should keep lightweight history with the Service.

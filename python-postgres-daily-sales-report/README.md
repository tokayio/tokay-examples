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

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy both candidates in one Project, connect both to the same `app` PostgreSQL database, schedule the generator for 8am in your timezone, and verify one report in the viewer.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in either deployed Service.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**. Tokay detects a Web Service in `viewer` and a Scheduled Job in `generator`.
3. Enter `every day at 8am` in the generator's **Runs** field, then check the upcoming runs and timezone.
4. Both Services start included. Choose one Project, then choose **Go live with 2 services**.
5. Open each Service's **Environment** page. Under **From your databases**, find `DATABASE_URL`, choose **Confirm database**, keep `app`, then choose **Confirm**. Do this for both Services so the generator and viewer share the same reports.
6. Check that only the viewer shows the Alembic migration, then continue the deployment and choose **Go live** if prompted. When the viewer is live, open it from its URL.

## Push with Git

1. Choose **Add code**, then **Git**.
2. Create a repository, follow the Git setup commands shown by Tokay, and push this folder. Then choose **Configure service**.
3. Set the generator schedule to `every day at 8am` and check the upcoming runs in your timezone.
4. Both Services start included. Choose one Project, then choose **Go live with 2 services**.
5. Connect both Services to the `app` database, then continue the deployment. Choose **Go live** if prompted, then open the viewer from its live URL.

## Try it

1. Open the generator Service and choose **Run now**.
2. Refresh the viewer and open yesterday's report from **Report history**.
3. Run the generator again. The same dated report gets a new generated time rather than a duplicate row.

## How it works

You only need one schema owner. The viewer applies the Alembic migration and seeds fictional orders, while the generator reads those tables, calculates its reporting windows, saves one dated result, and exits.

Tokay starts that short process on schedule and keeps every run result. If the calculation fails, the error stays attached to the run instead of disappearing into a long lived server log.

## Secrets

You do not need to add a secret. Tokay supplies the shared `DATABASE_URL` to both Services.

## Grow from here

Try the [uptime monitor](../python-uptime-monitor) when a scheduled job should keep lightweight history with the Service.

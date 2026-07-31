# Python uptime monitor

An uptime monitor checks one or more URLs, records status and latency, and alerts only when a site changes between up and down. Tokay runs the Python script as a Scheduled Service and preserves its SQLite history.

Start with Google and Example Domain to see two healthy checks before pointing it at your own service. The script exits after each pass, which keeps its schedule and failures easy to inspect.

## Guide and download

Read the full guide at https://tokay.io/examples/python-uptime-monitor. You can also
download the complete project at
https://tokay.io/examples/downloads/python-uptime-monitor.zip.

## What it does

Each run prints a result for every configured URL with its HTTP status, response time, and current up or down state.

The first observation establishes a baseline. A later state change writes one `ALERT` line and can send the same message to Slack or Discord.

Unchanged outages stay quiet on later runs, while the SQLite row count continues to show that checks are still happening.

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
5. Ask the agent to deploy the monitor with cron `*/5 * * * *`, run it twice, and confirm that `uptime.sqlite3` appears under **Saved Files**.

Never put the Tokay API token in this folder or in the deployed Service.

## Paste or upload

Open Tokay and choose **Add code**, then **Paste or upload**. Upload this whole folder and choose **Analyze**. Tokay detects one Scheduled Service. Choose a Project.

In **Schedule**, enter `every 5 minutes` and check the upcoming runs in your timezone. Choose **Test & Schedule**, follow the deployment tracker, and choose **Go Live** if that action appears.

## Push with Git

Choose **Add code**, then **Push with Git**. Create a repository, follow the Git setup commands shown by Tokay, and push this folder. Choose the detected Scheduled Service and a Project, set the five minute schedule, then choose **Test & Schedule**. Follow the deployment tracker and choose **Go Live** if that action appears.

## Try it

1. Choose **Run Now** twice and compare the accumulated row count in both results.
2. Open **Saved Files** and confirm that `uptime.sqlite3` is present.
3. Deploy again and run one more check. The count continues from the same database.

## Watch your own site

Open the Service's **Environment** page and find `MONITOR_URLS` under **From your code**. Choose **Set shared value** and enter one URL or a comma separated list. If you leave off the scheme, the monitor uses `https`.

The first check records the starting state. A later change writes an `ALERT` line, so healthy runs and an unchanged outage do not keep notifying you.

To send that alert to Slack or Discord, add an incoming webhook as `ALERT_WEBHOOK_URL`. The run log still records the alert if delivery fails.

## How it works

You get one alert per change because the script reads the last saved state before inserting the new result. It delivers a webhook only when those states differ, then exits normally.

Tokay starts the next pass on schedule and keeps its run output. The SQLite file survives deployments and restarts. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) for the storage details.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `ALERT_WEBHOOK_URL` | No | Sends state changes to a Slack or Discord incoming webhook. |

## Grow from here

Try the [Playwright price watcher](../python-playwright-price-watcher) when each check needs a real browser and screenshot.

# Python Playwright price watcher

A browser based price watcher reads a visible price, saves a full page screenshot, and alerts when the value changes or crosses your target. Tokay runs Chromium inside a Scheduled Service and keeps the history files between deployments.

The default check uses Tokay's public pricing page, so you can prove the browser and selector before choosing a product. After that, Config changes the URL and CSS selector without a code edit.

## Guide and download

Read the full guide at
https://tokay.io/examples/python-playwright-price-watcher. You can also download the
complete project at
https://tokay.io/examples/downloads/python-playwright-price-watcher.zip.

## What it does

Each run opens the configured page in Chromium and reads the first element matching `WATCH_SELECTOR`.

The script saves the parsed value to SQLite and replaces `last-price.png` with a current screenshot. Its run result names the browser version, observed price, previous price, and total history count.

A changed price creates an alert. Add `TARGET_PRICE` when you also want to know that a price moved down through a specific number.

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
5. Ask your agent to deploy the watcher with cron `0 */6 * * *`, run it once, and download `last-price.png` from the Service's saved files.

Never put the Tokay API token in this folder or in the deployed Service.

## Paste or upload

Open Tokay and choose **Add code**, then **Paste or upload**. Upload this whole folder and choose **Analyze**. The detected Scheduled Service already includes Chromium, so you do not need to install a browser.

Choose a Project. In **Schedule**, enter `every 6 hours` and check the upcoming runs in your timezone. Choose **Test & Schedule**, follow the deployment tracker, and choose **Go Live** if that action appears.

## Push with Git

Choose **Add code**, then **Git**. Create a repository, follow the Git setup commands shown by Tokay, and push this folder. Choose the detected Scheduled Service and a Project, set the six hour schedule, then choose **Test & Schedule**. Follow the deployment tracker and choose **Go Live** if that action appears.

## Try it

1. Choose **Run Now** and read the observed price in the run result. Ask your agent to download `last-price.png` if you want the screenshot.
2. Note the history count in the run result and deploy the same code again.
3. Run it once more. The screenshot is refreshed and the count grows in the preserved database.

## Watch another price

Open the Service's **Environment** page and find `WATCH_URL` under **From your code**. Choose **Set value** and enter the public product page. Set `WATCH_SELECTOR` the same way with a CSS selector for the visible price. Add `TARGET_PRICE` if you want an alert when the price crosses that number.

Set `ALERT_WEBHOOK_URL` to a Slack or Discord incoming webhook if you want alerts sent outside Tokay. A price change always alerts. Crossing the target adds a second reason to the same message.

Before watching a new site, check its terms and robots guidance. Keep the schedule gentle and do not automate a page that asks automated clients to stay away.

## How it works

You can use a real product page because Tokay provides Chromium in the Service environment. Playwright loads the page, finds the selected text, parses its first currency shaped number, and captures the screenshot.

If nothing matches, the run fails with a message that names both selector and URL. Successful runs write under Tokay's persistent data directory. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) to see how those files survive.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `ALERT_WEBHOOK_URL` | No | Sends alerts to a Slack or Discord incoming webhook. |

## Grow from here

Try the [PDF invoice generator](../python-pdf-invoice-generator) when system libraries should render a document from a web form instead.

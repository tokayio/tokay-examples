# Replace a Zap with Node.js

A lead intake workflow accepts form submissions, routes urgent and event requests, rejects duplicates, and builds a daily digest with a JSON archive. Tokay runs the receiver as a Function and the digest as a Scheduled Job over one PostgreSQL database.

Use this example when a visual automation has become important enough that you want its decisions in ordinary code. You can inspect each trigger, change the routing rule, and keep the resulting data in your own Project.

## Guide and download

Read the full guide at https://tokay.io/examples/node-replace-a-zap. You can also
download the complete project at
https://tokay.io/examples/downloads/node-replace-a-zap.zip.

## What it does

Send a name, email, service, and optional notes to `/submit`. The response tells you whether the lead entered the `priority`, `events`, or `general` route.

Repeat the same duplicate key and PostgreSQL keeps one lead while reporting the second request as a duplicate.

When the digest runs, its result counts each route and lists the last 24 hours of requests. A complete JSON archive for every run stays in the Service's saved files, where your assistant can download it.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy both candidates in one Project, connect both to the same `app` PostgreSQL database, schedule the digest for 8am in your timezone, and prove that one lead reaches the digest.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in either deployed Service.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**. Tokay detects a Function in `receiver` and a Scheduled Job in `digest`.
3. Enter `every day at 8am` in the digest's **Runs** field, then check the upcoming runs and timezone.
4. Both Services start included. Choose one Project, then choose **Go live with 2 services**.
5. Open each Service's **Environment** page. Under **From your databases**, find `DATABASE_URL`, choose **Confirm database**, keep `app`, then choose **Confirm**. Do this for both Services so the receiver and digest use the same data.
6. Continue the deployment and choose **Go live** if prompted.

## Push with Git

1. Choose **Add code**, then **Git**.
2. Create a repository, follow the Git setup commands shown by Tokay, and push this folder. Then choose **Configure service**.
3. Set the digest schedule to `every day at 8am` and check the upcoming runs in your timezone.
4. Both Services start included. Choose one Project, then choose **Go live with 2 services**.
5. Connect both Services to the `app` database, then continue the deployment. When the Function is live, copy its URL from the Service page.

## Try it

1. Copy the Function URL from the top of the receiver Service page. Replace the placeholder below with that URL, then send this urgent lead.

```sh
export FUNCTION_URL="https://your-function-url"
curl -X POST "$FUNCTION_URL/submit" \
  -H 'Content-Type: application/json' \
  -H 'x-dedupe-key: patio-lights-001' \
  -d '{"name":"Mira Chen","email":"mira@example.test","service":"patio lighting","notes":"The old transformer is broken and the event is Friday."}'
```

2. Send the same command again and confirm the response now reports a duplicate.
3. Choose **Run now** on the digest Service. Mira appears once under `priority` in the run result.

## How it works

The `/submit` route receives the event, `routeLead` contains the workflow decision, and Tokay stores the schedule, Secrets, and run history.

The receiver honors `x-dedupe-key` or derives one from the payload. PostgreSQL increments a duplicate count instead of inserting the same lead twice. The digest reads the last 24 hours and writes its archive under Tokay's persistent data directory.

When you move another workflow, add a route for its trigger and express the decision in code. Give it another Scheduled Job only when it truly needs a separate clock.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `ALERT_WEBHOOK_URL` | No | Delivers the digest to a Discord or Slack compatible webhook. Add it as a Project Secret on the digest only. |

`DATABASE_URL` comes from the shared managed PostgreSQL resource. It is not a Project Secret.

## Grow from here

Try the [webhook inspector](../node-webhook-inspector) when you want to study request validation and replay before adding workflow logic.

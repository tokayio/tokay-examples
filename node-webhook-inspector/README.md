# Node webhook inspector

A webhook inspector accepts test events, labels familiar payloads, verifies optional signatures, and returns a compact receipt to the sender. Tokay runs it as a Function and keeps each request beside its response, duration, and logs.

Use it when you are connecting a provider and need to understand the actual bytes reaching your code before you build the full workflow. You can begin with unsigned samples, then require HMAC signatures when the sender is ready.

## Guide and download

Read the full guide at https://tokay.io/examples/node-webhook-inspector. You can also
download the complete project at
https://tokay.io/examples/downloads/node-webhook-inspector.zip.

## What it does

Press **Send test event** and the request appears under **Requests** with the Function's JSON response and matching log line.

Send a payload containing an email and message and the handler labels it `form lead`. An `order.created` event receives `new order`, while anything else receives `general`.

Once `WEBHOOK_SECRET` is set, unsigned or invalid requests receive `401`. Generic SHA256 headers and Stripe style timestamped signatures are both accepted.

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
5. Ask your agent to deploy the Function, send one test event, and confirm that the request body has `source` set to `tokay` and the response status is `200`.

Never put the Tokay API token in this folder or in the deployed Function.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Function. Choose a Project, then choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, choose **Send test event**.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Function and a Project. Choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, choose **Send test event**.

## Try it

1. Copy the Function URL from the top of the Service page. Replace the placeholder below with that URL, then send the form event.

```bash
export FUNCTION_URL="https://your-function-url"
curl -X POST "$FUNCTION_URL/hooks/forms" \
  -H "content-type: application/json" \
  -d '{"email":"mira@example.com","message":"Could you quote the autumn workshop?"}'
```

2. Open **Requests** and confirm the response tag is `form lead`.
3. Choose **Copy as cURL** and replay the request. The new history entry gives you the same response from the same body.

## Turn on signature checks

When you are ready to reject unsigned requests, open the Function's **Environment** page and find `WEBHOOK_SECRET` under **From your code**. Choose **Set value**, save the secret, and deploy again.

Generic senders can put the lowercase HMAC SHA256 digest in `x-webhook-signature`, with or without the `sha256=` prefix. Stripe style signatures with `t` and `v1` fields work too.

Unsigned or invalid requests now return 401. **Send test event** is unsigned, so use that button before adding the secret. Afterward, replay a signed request from your provider.

## How it works

You can inspect signatures correctly because Express keeps the raw body instead of parsing and rebuilding it first. The handler checks the optional secret, applies one small tagging rule, and returns its receipt.

Tokay puts the public Function URL and request history around that code. You get a debugging surface without adding an event dashboard to the project.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `WEBHOOK_SECRET` | No | Requires a valid generic or Stripe style signature. |

## Grow from here

Try [Replace a Zap](../node-replace-a-zap) when each event should enter a database and feed a scheduled digest.

# Node Kimi K3 streaming chat

A Kimi K3 chat page streams long answers, renders readable Markdown, and carries the complete thread into every follow up. Tokay runs the Express app as one Web Service and keeps your Moonshot API key encrypted.

Use this example when you want to see how a reasoning model's conversation state and usage data move through a small hosted chat. Your Moonshot account needs Kimi K3 access before the Service can answer.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-kimi-k3-streaming-tool-chat. You can also download the
complete project at
https://tokay.io/examples/downloads/node-kimi-k3-streaming-tool-chat.zip.

## What it does

The opening prompt asks Kimi to plan a trip, but you can replace it with any question.

The answer arrives piece by piece and supports lists, tables, links, and code. Ask another question and Kimi receives the earlier messages, including the reasoning payload its API requires you to return.

Below each response, the page shows elapsed time and token counts. **New chat** clears the visible conversation and begins a fresh session.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the chat.

The running app needs your Moonshot key. Your assistant asks you for it and stores it as a shared Project Secret named `MOONSHOT_API_KEY`, which nobody can read back. Never put the key in this folder.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add your Moonshot key using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add your Moonshot key using the steps below.

## Add your Kimi API key

Create a key in the [Kimi API Platform](https://platform.kimi.ai/console/api-keys). On the Service page, open **Environment** and find `MOONSHOT_API_KEY` under **From your code**. Choose **Set value**, then paste and save your Kimi key. It stays encrypted.

After saving the Kimi key, continue the deployment and choose **Go live** if prompted. Open the chat from the live URL at the top of the Service.

## Try it

1. Send the trip question and wait for the streamed answer to finish.
2. Ask Kimi to revise one detail from that answer without restating the plan.
3. Press **New chat** and ask the same follow up. The missing context proves you started a separate thread.

## How it works

You keep context in the page because the Kimi API is stateless. The browser sends the thread to the server on every turn, and the server forwards visible answer deltas over SSE.

Kimi's reasoning deltas stay out of the interface, but the server retains their complete payload and returns it unchanged on the next request. The demo selects low reasoning effort and lets Moonshot AI enforce the model's context limit.

Marked and DOMPurify turn model Markdown into safe page content. Your API key and conversation are never written to application storage.

## Secrets

| Name | Visibility | Required | Purpose |
|---|---|---|---|
| `MOONSHOT_API_KEY` | Secret | Yes | Authenticates requests to Moonshot AI. |

## Grow from here

Try the [AI research queue](../python-fastapi-postgres-ai-research-queue) when Kimi should work from saved evidence in a recoverable job.

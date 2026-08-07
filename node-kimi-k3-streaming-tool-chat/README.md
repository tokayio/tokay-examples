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

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask your agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

Your agent needs a Tokay API token to create the deployment. The running app separately needs your Moonshot key.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **Platform tokens**, and choose **New Token**.
2. Save the Tokay token in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the chat and stop if `MOONSHOT_API_KEY` is not available.

If you want your agent to finish the setup, save your Moonshot key in their secret store and ask them to store `MOONSHOT_API_KEY` as a shared Project Secret. Otherwise, add the key yourself using the steps below. Never put the key in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Add your Moonshot key using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Add your Moonshot key using the steps below.

## Add your Kimi API key

Create a key in the [Kimi API Platform](https://platform.kimi.ai/console/api-keys). On the Service page, open **Environment** and find `MOONSHOT_API_KEY` under **From your code**. Choose **Set shared value**, keep the value secret, and save your Kimi key.

Once the Kimi key is **Good to go**, finish the deployment tracker and use **Go Live** if offered. Open the chat from the live URL at the top of the Service.

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

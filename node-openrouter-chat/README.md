# Node OpenRouter configurable model chat

A streaming chat page lets you hold a conversation with any model available through OpenRouter and change that model without editing the app. Tokay runs it as one Web Service while keeping the API key private and the model choice visible as Config.

This separation is useful when you want to compare providers or let a team choose the model without giving everyone access to its credential. The server reads both values at runtime and refuses to guess when either one is missing.

## Guide and download

Read the full guide at https://tokay.io/examples/node-openrouter-chat. You can also
download the complete project at
https://tokay.io/examples/downloads/node-openrouter-chat.zip.

## What it does

The page starts with a trip planning prompt that you can replace with any question.

Send a message and the answer appears as it streams. Follow up in the same thread and the model receives the earlier conversation for context.

Each answer shows its response time and token use. When OpenRouter reports cached input, the same line shows how many tokens were reused. Press **New chat** whenever you want a clean thread.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask the agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

Your agent needs a Tokay API token to create the deployment. The running app separately needs your OpenRouter key and a model slug.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **API**, and choose **New Token**.
2. Save the Tokay token in the agent's secret store.
3. Give your agent this folder or its GitHub URL.
4. Point the agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask the agent to deploy the chat and stop if the OpenRouter key or model slug is not available.

If you want the agent to finish the setup, save your OpenRouter key in its secret store and tell it which model slug to use. Ask it to store `OPENROUTER_API_KEY` as a shared Project Secret and `OPENROUTER_MODEL` as shared Project Config. Otherwise, add both values yourself using the steps below. Never put the key in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Add the OpenRouter values using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Add the OpenRouter values using the steps below.

## Add your OpenRouter key and model

1. Create a key on the [OpenRouter keys page](https://openrouter.ai/settings/keys).
2. Choose a model from the [OpenRouter model list](https://openrouter.ai/models) and copy its full slug, such as `provider/model-name`.
3. On the Service page, open **Environment** and find `OPENROUTER_API_KEY` under **From your code**. Choose **Set shared value**, keep **Visibility** on **Secret**, and save the key.
4. Find `OPENROUTER_MODEL` and choose **Set shared value**. Change **Visibility** to **Config**, paste the model slug, and save it.

Finish the deployment tracker after both OpenRouter rows say **Good to go**. Choose **Go Live** if Tokay presents it. The live URL at the top of the Service opens the chat.

## Try it

1. Send the starting question, then ask a follow up that depends on the first answer.
2. Change `OPENROUTER_MODEL` in Project Config and restart the Service.
3. Start a new chat. The status line names the new model without exposing your API key.

## How it works

You can switch models because the browser never calls a provider directly. It sends the full conversation to the Express server, which selects `OPENROUTER_MODEL` and streams the provider's answer back over SSE.

At startup, the server asks OpenRouter for the chosen model's context length. A stable session ID keeps the conversation with the same provider and gives eligible prompt caching a consistent key.

Your API key stays on the server and is never written into the conversation or application data.

## Secrets

| Name | Visibility | Required | Purpose |
|---|---|---|---|
| `OPENROUTER_API_KEY` | Secret | Yes | Authenticates requests to OpenRouter. |
| `OPENROUTER_MODEL` | Config | Yes | Selects the OpenRouter model slug used for every request. |

## Grow from here

Try the [AI research queue](../python-fastapi-postgres-ai-research-queue) when model work should continue after the browser closes.

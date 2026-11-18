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

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the chat.

The running app needs your OpenRouter key and a model slug. Your assistant asks you for both. It stores the key as a shared Project Secret named `OPENROUTER_API_KEY` and the slug as shared Project Config named `OPENROUTER_MODEL`. Never put the key in this folder.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add the OpenRouter values using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add the OpenRouter values using the steps below.

## Add your OpenRouter key and model

1. Create a key on the [OpenRouter keys page](https://openrouter.ai/settings/keys).
2. Choose a model from the [OpenRouter model list](https://openrouter.ai/models) and copy its full slug, such as `provider/model-name`.
3. On the Service page, open **Environment** and find `OPENROUTER_API_KEY` under **From your code**. Choose **Set value**, paste the key, and save it. Leave **Keep it readable** unchecked so the key stays a Secret.
4. Find `OPENROUTER_MODEL` and choose **Set value**. Paste the model slug, check **Keep it readable** so it is stored as Config, and save it.

After saving the OpenRouter key and model, continue the deployment and choose **Go live** if prompted. The live URL at the top of the Service opens the chat.

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

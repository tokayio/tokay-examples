# Node OpenAI streaming chat

An OpenAI chat page streams answers from `gpt-5-mini`, renders safe Markdown, and keeps follow up questions grounded in the current thread. Tokay hosts it as one Web Service and keeps your OpenAI API key out of the browser.

This is a compact example of the Responses API in a real interface. The browser owns the visible conversation, while the server owns provider access and streaming.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-openai-streaming-tool-chat. You can also download the
complete project at
https://tokay.io/examples/downloads/node-openai-streaming-tool-chat.zip.

## What it does

The page opens with a trip planning prompt ready to send or rewrite.

OpenAI's answer streams into the conversation and formats lists, links, tables, and code. Your next message includes the earlier exchange, so you can ask for a revision without starting over.

Every answer keeps its elapsed time and token totals beside it. Cached input appears there when the API reports it, and **New chat** resets the thread.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the chat.

The running app needs your OpenAI key. Your assistant asks you for it and stores it as a shared Project Secret named `OPENAI_API_KEY`, which nobody can read back. Never put the key in this folder.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add your OpenAI key using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add your OpenAI key using the steps below.

## Add your OpenAI API key

Create a key on the [OpenAI API keys page](https://platform.openai.com/api-keys). On the Service page, open **Environment** and find `OPENAI_API_KEY` under **From your code**. Choose **Set value**, and store the key. Tokay keeps it encrypted.

After saving the OpenAI key, continue the deployment and choose **Go live** if prompted. Then use the Service's live URL to start chatting.

## Try it

1. Send the starting prompt and watch the text arrive before the full answer is complete.
2. Ask for one change to the plan and check that the response uses the prior details.
3. Start a new chat and confirm the old messages no longer travel with your request.

## How it works

You see a continuous answer because the Express server turns Responses API events into an SSE stream for the browser. Each turn carries the full conversation plus a stable cache key for eligible prompt prefix reuse.

The server reserves room for reasoning and visible output, then lets OpenAI enforce the model's context boundary.

The page sanitizes rendered Markdown with DOMPurify. The API key stays in the server environment, and the app does not save the conversation.

## Secrets

| Name | Visibility | Required | Purpose |
|---|---|---|---|
| `OPENAI_API_KEY` | Secret | Yes | Authenticates requests to OpenAI. |

## Grow from here

Try the [AI research queue](../python-fastapi-postgres-ai-research-queue) when a model request needs to become a saved job that survives restarts.

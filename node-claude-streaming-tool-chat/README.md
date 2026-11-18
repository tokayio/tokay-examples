# Node Claude streaming chat

A Claude chat page streams answers from `claude-sonnet-5-5`, preserves context for follow up questions, and renders model Markdown safely. Tokay runs the Node.js app as one Web Service with your Anthropic key stored as a Secret.

Use this project to follow Anthropic's Messages API from a browser conversation through the SDK stream and back. The interface stays useful while the private credential never reaches client code.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-claude-streaming-tool-chat. You can also download the
complete project at
https://tokay.io/examples/downloads/node-claude-streaming-tool-chat.zip.

## What it does

The composer begins with a trip planning question that you can send as written or replace.

Claude's text appears while it is generated, then stays in the thread for your next question. Markdown lists, tables, links, and code become safe page content.

The response footer records elapsed time and token use. Press **New chat** to clear the conversation and begin without earlier context.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the chat.

The running app needs your Anthropic key. Your assistant asks you for it and stores it as a shared Project Secret named `ANTHROPIC_API_KEY`, which nobody can read back. Never put the key in this folder.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add your Anthropic key using the steps below.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Add your Anthropic key using the steps below.

## Add your Anthropic API key

Create a key in the [Anthropic Console](https://console.anthropic.com/settings/keys). On the Service page, open **Environment** and find `ANTHROPIC_API_KEY` under **From your code**. Choose **Set value**, paste the Anthropic key, and save it as a Secret.

After saving the Anthropic key, continue the deployment and choose **Go live** if prompted. Then open Claude from the Service URL.

## Try it

1. Send the provided question and watch Claude answer before the request finishes.
2. Refer to one place from the response and ask for a different recommendation.
3. Clear the chat and repeat that request. Claude now asks for the context it no longer has.

## How it works

You can continue the thread because the browser sends its messages again on each turn. The server streams Claude's text deltas over SSE, then reads the SDK's final accumulated message for the authoritative usage and stop reason.

The demo reserves output space and lets Anthropic enforce Claude's context limit. If the model reaches that boundary, the page tells you to begin a new chat.

Marked handles the Markdown syntax and DOMPurify removes unsafe HTML. Neither the key nor the conversation is stored as application data.

## Secrets

| Name | Visibility | Required | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Secret | Yes | Authenticates requests to Anthropic. |

## Grow from here

Try the [AI research queue](../python-fastapi-postgres-ai-research-queue) when Claude should synthesize evidence outside a browser request.

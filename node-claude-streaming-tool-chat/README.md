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

## Deploy with your agent

If your client supports remote MCP, connect it to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the browser sign in,
and ask your agent to deploy this folder without pasting a token. Otherwise,
follow the API token steps below.

Your agent needs a Tokay API token to create the deployment. The running app separately needs your Anthropic key.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **You**, then **API & MCP tokens**, and choose **New token**.
2. Save the Tokay token in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the chat and stop if `ANTHROPIC_API_KEY` is not available.

If you want your agent to finish the setup, save your Anthropic key in their secret store and ask them to store `ANTHROPIC_API_KEY` as a shared Project Secret. Otherwise, add the key yourself using the steps below. Never put the key in this folder.

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

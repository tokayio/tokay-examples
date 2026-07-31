# Node WebSocket chat

A room chat sends messages and presence updates instantly across `general`, `music`, and `games`, then reconnects open tabs after a deployment. Tokay runs the Express and WebSocket server together as one Web Service.

Use it when your app needs long lived connections and shared process state instead of isolated HTTP requests. Recent messages deliberately stay in memory, which makes a restart easy to observe.

## Guide and download

Read the full guide at https://tokay.io/examples/node-websocket-chat. You can also
download the complete project at
https://tokay.io/examples/downloads/node-websocket-chat.zip.

## What it does

Enter your name, choose a room, and send a message from the composer. Everyone currently in that room sees it with your name and time.

**Here now** tracks connected people and the longest open connection. Join and leave notices appear in the conversation as tabs move between rooms or close.

The header shows **Connected** while the socket is healthy and **Reconnecting** while a new server version starts.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask the agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **API**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or its GitHub URL.
4. Point the agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask the agent to deploy the chat, prove that `/ws` accepts a WebSocket connection, and confirm that `/health` still responds while the connection remains open.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, click the live URL in the top section to open the chat.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, click the live URL in the top section to open the chat.

## Try it

1. Open two tabs with different names and join `#music` in both.
2. Send a message from one tab, then close the other and watch **Here now** update.
3. Leave the first tab open while you deploy again. It shows **Reconnecting** and returns to `#music` when the new process is ready.

## Deploy while connected

Change some page copy or deploy the same app again. Each open tab shows **Reconnecting** and returns to the same room when the new version is ready.

Recent messages disappear because this example keeps only session memory. Add Redis or a database when messages need to survive a deployment.

## How it works

You only publish one address because the static page and `/ws` upgrade share the same HTTP server. The process keeps the latest 50 messages per room and sends a heartbeat every 30 seconds to remove dead sockets.

Incoming names and messages are bounded and rendered as text, not HTML. Add Redis or a database when the room history needs to outlive the process.

## Secrets

This public chat needs no secret. Anyone with the live URL can join one of its rooms.

## Grow from here

Try the [receipt box](../node-sqlite-uploads-receipt-box) when local data should survive deployments and restarts.

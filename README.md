# Tokay examples

Pick the example closest to what you want to deploy. Every folder is a complete, working app that you can give to an agent, upload, or push with Git.

Browse the full guides and downloads at [tokay.io/examples](https://tokay.io/examples) before you clone anything.

If this is your first time using Tokay, start with [Deploy me](./deploy-me). You will put a guestbook online, add a message, and prove that the message survives another deployment.

Each README tells you what the app needs, which choices to make in Tokay, and what to try when the deployment is ready.

## Deploy one

### Tell your agent

The fastest path is MCP. Connect your client to the [Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in when your browser opens, then ask your agent to deploy the example folder and prove its main feature. There is no token to paste.

No MCP support? Give your agent the example folder and [Tokay's agent instructions](https://app.tokay.io/llms.txt). Create a Tokay API token from **Account**, then **API**, and save it in the agent's secret store. Never put this token in the example or the deployed app.

### Paste or upload

Open Tokay and choose **Add code**, then **Paste or upload**. Upload the example folder and choose **Analyze**. Tokay shows you the Services the app needs and any choices that require your attention. Choose a Project, then use **Deploy**, **Test & Schedule**, or **Deploy 2 Services** as directed by the example README.

Complete any required setup on each Service's **Environment** page, then follow the deployment tracker. If **Go Live** appears, choose it. The example README tells you what to open or run to confirm the result.

### Push with Git

Open Tokay and choose **Add code**, then **Push with Git**. Create a repository and follow the Git setup commands shown by Tokay. Push the example folder, then choose the detected Services and a Project. Use **Deploy**, **Test & Schedule**, or **Deploy 2 Services** as directed by the example README.

Complete any required setup on each Service's **Environment** page and follow the deployment tracker. If **Go Live** appears, choose it. Once the Service is live, follow its README to try the main feature.

## Featured examples

1. [Deploy me](./deploy-me) puts a guestbook online and proves that its SQLite data survives another deployment.
2. [Movie and show watchlist](./node-vite-react-express-postgres-watchlist) shows how a Vite client, Express server, and PostgreSQL database deploy together.
3. [Discord bot](./node-discord-bot) stays connected on an always on server and gives you useful logs when you test its commands.
4. [Replace a Zap](./node-replace-a-zap) receives lead requests and sends a scheduled digest from the same saved data.
5. [Event tickets](./node-nextjs-postgres-event-tickets) lets you reserve tickets through a server rendered Next.js app, with optional Stripe test checkout.
6. [AI research queue](./python-fastapi-postgres-ai-research-queue) keeps long AI research jobs moving and resumes unfinished work after a crash.
7. [Private sales analytics MCP](./node-express-sqlite-mcp-orders) gives a headless agent read only sales tools protected by a machine token.
8. [OAuth MCP task inbox](./node-express-sqlite-oauth-mcp-task-list) shows how to deploy a multi-user remote MCP server with visitor OAuth and no OAuth code.
9. [Support dashboard](./python-streamlit-support-dashboard) gives coworkers a private dashboard without adding login code to the app.

## Start with your language

1. [Deploy me](./deploy-me) puts a small Node.js guestbook online and keeps its SQLite data through another deployment.
2. [Node Express API](./node-express-api) gets an ordinary Express app online and ready for requests.
3. [Python FastAPI API](./python-fastapi-api) lets you try validation and FastAPI's interactive API docs.
4. [Go API](./go-api) deploys a standard `net/http` server from source.
5. [Ruby Sinatra API](./ruby-sinatra-api) takes a familiar Sinatra app straight to a live URL.
6. [PHP PostgreSQL guestbook](./php-postgres-guestbook) saves guestbook entries from one PHP file.
7. [Rust Axum API](./rust-axum-api) compiles and runs an Axum app without asking you to ship a binary.
8. [Bun Hono API](./bun-hono-api) gives you a live Hono API and confirms that Bun is running it.
9. [HTML portfolio site](./html-portfolio-site) puts a plain folder of HTML and CSS online.

## Websites, apps, and APIs

1. [PostgreSQL task tracker](./node-express-postgres-task-tracker) gives you a complete task app with saved data, filters, pagination, and a JSON API.
2. [React PostgreSQL watchlist](./node-vite-react-express-postgres-watchlist) keeps a Vite client, Express server, and database together as one app.
3. [Next.js event tickets](./node-nextjs-postgres-event-tickets) lets visitors reserve workshop tickets and can use Stripe test checkout when you are ready.
4. [Django cat adoption](./python-django-postgres-cat-adoption) gives visitors search and gives you optional access to Django admin.
5. [Laravel event space booking](./php-laravel-postgres-event-space-booking) accepts bookings and runs reminders on a separate schedule.

## AI apps and integrations

1. [OpenRouter model chat](./node-openrouter-chat) lets you chat with a model chosen through Config while keeping the OpenRouter API key secret.
2. [Kimi K3 chat](./node-kimi-k3-streaming-tool-chat) provides a multi-turn Markdown chat through Moonshot AI.
3. [OpenAI chat](./node-openai-streaming-tool-chat) provides a multi-turn Markdown chat through OpenAI's Responses API.
4. [Claude chat](./node-claude-streaming-tool-chat) provides a multi-turn Markdown chat through Anthropic's Messages API.
5. [Private sales analytics MCP](./node-express-sqlite-mcp-orders) gives a headless agent four read only tools over saved order data using a machine token.
6. [OAuth MCP task inbox](./node-express-sqlite-oauth-mcp-task-list) gives every visitor a private task list through one remote MCP endpoint.
7. [AI research queue](./python-fastapi-postgres-ai-research-queue) keeps the web app responsive while a Background Worker handles longer research jobs.

## Automations and scheduled work

1. [Webhook inspector](./node-webhook-inspector) gives you a public endpoint and a clear record of each request and response.
2. [Daily sales report](./python-postgres-daily-sales-report) creates a fresh report on a schedule and serves it from a small web viewer.
3. [Uptime monitor](./python-uptime-monitor) checks sites on a schedule and alerts only when their status changes.
4. [Playwright price watcher](./python-playwright-price-watcher) opens a real browser on a schedule and keeps the screenshot history.
5. [Replace a Zap](./node-replace-a-zap) collects leads as they arrive and sends a digest later from the same data.

## Bots, workers, and realtime apps

1. [Discord bot](./node-discord-bot) stays online, responds to three slash commands, and reconnects after a restart.
2. [Slack bot](./node-slack-bot) stays connected through Socket Mode and needs no public URL.
3. [PDF statement queue](./node-express-bullmq-redis-statement-generator) lets you watch a Background Worker make statements while the web page reports progress.
4. [WebSocket chat](./node-websocket-chat) gives everyone in a room live messages and presence from one long running process.

## Persistent VM apps

1. [Receipt box](./node-sqlite-uploads-receipt-box) keeps uploaded receipt images and their SQLite records together through another deployment.
2. [PDF invoice generator](./python-pdf-invoice-generator) turns line items into a finished invoice and keeps recent PDFs ready to download.
3. [Prisma migrations walkthrough](./node-prisma-migrations-walkthrough) lets you see a safe schema change deploy automatically and review a destructive one before it runs.

## Coworker and mixed access apps

1. [Streamlit support dashboard](./python-streamlit-support-dashboard) gives your coworkers a private Streamlit app without adding application auth.
2. [Visitor registration](./node-internal-visitor-registration) keeps the staff dashboard private while visitors can still reach the exact `/submit` path.

## License

The code in this repository is available under the [MIT License](./LICENSE).

# Private sales analytics MCP server

A sales analytics MCP server lets your AI agent summarize revenue, find customers, inspect recent orders, and rank products without opening the whole database. Tokay runs it as one Web Service with durable SQLite storage and optional Machine access.

Use this pattern when your automation needs a revocable identity instead of a person's login. The tool boundary keeps every request read only and limits the amount of order data returned.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-express-sqlite-mcp-orders. You can also download the
complete project at
https://tokay.io/examples/downloads/node-express-sqlite-mcp-orders.zip.

## What it does

The landing page shows the MCP endpoint and ready to run commands for Claude Code and MCP Inspector.

Ask how sales performed over a period, search for a customer such as Maya, request recent orders, or compare the products leading revenue. Each tool accepts a small bounded input rather than arbitrary SQL.

You can test the endpoint while the Service is Public, then protect it with a Tokay Machine credential before your headless agent begins regular work.

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
5. Ask your agent to deploy the MCP server, make it private, create a Machine and credential, call `sales_summary`, and prove that the order history survives another deployment.

The Tokay API token manages the deployment. It does not give anyone access to the deployed MCP endpoint. Never put it in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to open the MCP landing page.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to open the MCP landing page.

## Test it while the Service is Public

The landing page gives you the exact command for connecting Claude Code. Run it, then ask Claude `How were sales last week?`

If you want to test the tools without a model, use the MCP Inspector command shown on the same page.

## Connect your headless agent with a Machine credential

1. On the Service page, open the **Access** tab. Under **Who can open it**, choose **New Machine**, name it `claude-orders`, and choose **Create Machine**.
2. Tokay allows the Machine on this Service and shows its first token. Copy the full value now because Tokay shows it once.
3. Beside the Service name, switch **Public** to **Private**.
4. Run the private Claude Code command shown on the app's landing page. Replace `<machine-credential>` with the token you just copied.
5. Ask Claude `What sold best in the last 30 days?` Then open **Access** in the sidebar and choose **Who went where** to see the Machine and credential used.

This Machine credential only lets a program call the private app. It cannot deploy code or manage Tokay.

The Machine represents your automation, not a person. You can revoke its credential without changing any human account. Claude Code and other MCP clients that accept bearer headers can use it directly.

## Rotate credentials without replacing the Machine

You can replace a credential without creating another Machine or splitting its access history.

1. Open **Access**, choose **Machines**, then `claude-orders`. Choose **Issue a credential**, name it `claude-code-2`, and choose **Issue credential**.
2. Update your MCP client to use the new value, then call `sales_summary` again.
3. Revoke the original credential.
4. Confirm the old value is denied while `claude-code-2` still works.
5. Open **Who went where**. Both calls remain under `claude-orders`, and each one names the credential used.

## Try it

1. Ask `How were sales last week?` and note the order count and revenue.
2. Deploy the same code again.
3. Repeat the question. The same seeded order history is still in SQLite.

## How it works

Each named MCP tool validates a bounded input and runs one fixed read only query, so callers cannot submit arbitrary SQL.

The app adds its fictional order history only when the SQLite database is empty. Tokay preserves that file through restarts and deployments. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) to see how the data is protected.

## Secrets

You do not need a Project Secret. Private access uses a Machine credential allowed on the Service, while Public smoke tests need no credential.

## Grow from here

Try the [OAuth task inbox](../node-express-sqlite-oauth-mcp-task-list) when each person should authorize an MCP client with their own email and see only their own data.

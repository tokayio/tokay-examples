# Deploy a private sales analytics MCP server

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

You can test the endpoint while the Project is public, then protect it with a Tokay Machine credential before your headless agent begins regular work.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask your agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **Platform tokens**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the MCP server, make it private, create a Machine and credential, call `sales_summary`, and prove that the order history survives another deployment.

The Tokay API token manages the deployment. It does not give anyone access to the deployed MCP endpoint. Never put it in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, click the live URL in the top section to open the MCP landing page.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, click the live URL in the top section to open the MCP landing page.

## Test it while the Project is public

The landing page gives you the exact command for connecting Claude Code. Run it, then ask Claude `How were sales last week?`

If you want to test the tools without a model, use the MCP Inspector command shown on the same page.

## Connect your headless agent with a Machine credential

1. Choose **App audience** in the Project.
2. Set **Audience** to **Specific people**. Keep the people you want, then choose **Save audience** and confirm with **Save**.
3. Under **Machines**, choose **Create Machine**. Name it `claude-orders`, then choose **Create Machine**.
4. On the new Machine, choose **Issue credential**. Name it `claude-code`, choose **Issue credential**, and copy the full value from the next dialog. Save it now because Tokay shows it once.
5. Run the private Claude Code command shown on the app's landing page. Replace `<machine-credential>` with the value you just copied.
6. Ask Claude `What sold best in the last 30 days?` Then check **Access log** in Tokay to see the Machine and credential used.

This Machine credential only lets a program call the private app. It cannot deploy code or manage Tokay.

The Machine represents your automation, not a person. You can revoke its credential without changing any human account. Claude Code and other MCP clients that accept bearer headers can use it directly.

## Rotate credentials without replacing the Machine

You can replace a credential without creating another Machine or splitting its access history.

1. Issue a second credential from `claude-orders` and name it `claude-code-2`.
2. Update your MCP client to use the new value, then call `sales_summary` again.
3. Revoke the original `claude-code` credential.
4. Confirm the old value is denied while `claude-code-2` still works.
5. Open **Access log**. Both calls remain under `claude-orders`, and each one names the credential used.

## Try it

1. Ask `How were sales last week?` and note the order count and revenue.
2. Deploy the same code again.
3. Repeat the question. The same seeded order history remains in SQLite.

## How it works

You can trust the access boundary because the server exposes named MCP tools rather than a database prompt. Each tool validates its inputs, runs one bounded query, and returns only the requested result.

The app adds its fictional order history only when the SQLite database is empty. Tokay preserves that file through restarts and deployments. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) to see how the data is protected.

## Secrets

You do not need a Project Secret. Private access uses a Machine credential issued under **App audience**, while public smoke tests need no credential.

## Grow from here

Try the [OAuth task inbox](../node-express-sqlite-oauth-mcp-task-list) when each person should authorize an MCP client with their own email and see only their own data.

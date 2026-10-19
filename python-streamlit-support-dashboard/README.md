# Python Streamlit support dashboard

A support dashboard helps coworkers track open tickets, response time, queue history, category backlog, and notes for the next shift. Tokay runs the Streamlit app as one private Web Service without adding sign in code to the project.

This is a good fit for an internal tool built quickly from Python data components. Streamlit stays focused on the dashboard, PostgreSQL keeps shared state, and Tokay decides who may reach it.

## Guide and download

Read the full guide at
https://tokay.io/examples/python-streamlit-support-dashboard. You can also download
the complete project at
https://tokay.io/examples/downloads/python-streamlit-support-dashboard.zip.

## What it does

The top row shows how many tickets are open now, how many opened or resolved in the selected range, and the median first response time.

Change **Date range** to update the queue history chart. **Current backlog** compares open work by category, and **Newest open tickets** gives the team a compact working list.

Under **Team annotations**, edit the context attached to a recent date and press **Save annotations**. The next coworker sees the same note.

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
5. Ask your agent to deploy the dashboard with PostgreSQL, make the Service Private, allow the support staff, and confirm that a signed out visitor cannot reach Streamlit.

Never put the Tokay API token in this folder or in the deployed dashboard.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Finish setup in Tokay

The dashboard needs PostgreSQL to keep the ticket history and team notes. Open **Environment** and find `DATABASE_URL` under **From your databases**. Choose **Confirm database**, keep the suggested `app` name, then choose **Confirm**.

After connecting the Service to the `app` database, continue the deployment and choose **Go live** if prompted. Before sharing the finished Service URL, use the steps below to make the dashboard private.

## Make the dashboard private

1. Change the dashboard from **Public** to **Private** beside its Service name.
2. Open the **Access** tab. Under **Who can open it**, add each support staff email or your company email domain. Visitors receive a magic link when they first open the dashboard.

Open the live URL in a signed out browser. Tokay starts the sign in flow before Streamlit appears.

## Try it

1. Narrow **Date range** and note how the queue chart and metrics change.
2. Edit one team annotation and press **Save annotations**.
3. Deploy the dashboard again. Your note and the 90 day ticket history remain in PostgreSQL.

## How it works

You can build the whole interface with ordinary Streamlit components. Pandas supplies the chart data, while SQLAlchemy reads and updates the same PostgreSQL database for every coworker.

The Alembic migration stays beside the app, and Tokay tests it against a copy before applying it. Fictional ticket history appears only when the tables are empty.

Tokay stops unapproved visitors before Streamlit handles their request. You can add a company email domain or specific people without changing Python code.

## Secrets

You do not need an application secret. Tokay supplies `DATABASE_URL`, and the Service's access list controls who can open it.

## Grow from here

Try [visitor registration](../node-internal-visitor-registration) when one path in a private app needs to remain public.

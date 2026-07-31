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
5. Ask the agent to deploy the dashboard with PostgreSQL, restrict the Project to Project members, and confirm that a signed out visitor cannot reach Streamlit.

Never put the Tokay API token in this folder or in the deployed dashboard.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Finish setup in Tokay

The dashboard needs PostgreSQL to keep the ticket history and team notes. Open **Environment** and find `DATABASE_URL` under **From your infrastructure**. Choose **Confirm database**, keep the suggested `app` name, then choose **Confirm**.

Continue through the deployment tracker after `DATABASE_URL` reaches **Good to go**. Choose **Go Live** if it appears. Before sharing the finished Service URL, use the steps below to make the dashboard private.

## Make the dashboard private

1. Choose **App audience** from the Project.
2. Set **Audience** to **Specific people**. Leave **Project members** selected so your teammates can sign in.
3. Choose **Save audience**. Review **Restrict who can visit**, then choose **Save**.
4. To invite someone else, choose **Add visitor**, enter the coworker's email, and choose **Add**. They will receive a magic link when they first visit.

Open the live URL in a signed out browser. Tokay starts the sign in flow before Streamlit appears.

## Try it

1. Narrow **Date range** and note how the queue chart and metrics change.
2. Edit one team annotation and press **Save annotations**.
3. Deploy the dashboard again. Your note and the 90 day ticket history remain in PostgreSQL.

## How it works

You can build the whole interface with ordinary Streamlit components. Pandas supplies the chart data, while SQLAlchemy reads and updates the same PostgreSQL database for every coworker.

The Alembic migration stays beside the app, and Tokay tests it against a copy before applying it. Fictional ticket history appears only when the tables are empty.

Audience settings stop unapproved visitors before Streamlit handles their request. You can add Project members, approved email domains, or specific people without changing Python code.

## Secrets

You do not need an application secret. Tokay supplies `DATABASE_URL`, and the Project audience controls coworker access.

## Grow from here

Try [visitor registration](../node-internal-visitor-registration) when one path in a private app needs to remain public.

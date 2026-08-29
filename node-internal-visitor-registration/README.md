# Node internal visitor registration

A visitor desk gives staff a private arrival list while guests use one public form to register their name, host, and arrival time. Tokay runs both views as one Web Service and opens only the exact guest path.

Use this shape when most of an internal app should require sign in but one narrow action belongs to the public. Your server keeps its normal routes while Tokay enforces the boundary before requests arrive.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-internal-visitor-registration. You can also download
the complete project at
https://tokay.io/examples/downloads/node-internal-visitor-registration.zip.

## What it does

The private dashboard shows today's expected visitors as cards and keeps the full registration history in a table.

At `/submit`, a guest enters their name, who they are meeting, and a time within the next 180 days. The confirmation page repeats the accepted visit details.

Every public submission appears on the staff page with **Guest link** as its source. A visitor cannot use the form to claim a private source such as **Host added**.

## Deploy with your agent

If your client supports remote MCP, connect it to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the browser sign in,
and ask your agent to deploy this folder without pasting a token. Otherwise,
follow the API token steps below.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **You**, then **API & MCP tokens**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the app, make the Service Private for a staff Group, open the exact public path `/submit`, and prove that a guest registration survives another deployment.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, use the steps below to set access before sharing the URL.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, use the steps below to set access before sharing the URL.

## Keep the staff pages private

1. On the Service page beside the URL, change **Public** to **Private**.
2. Open the Service **Access** tab and create a Group named `Staff`.
3. Add each staff email or the company email domain, then choose **Done** to attach the Group.
4. In **Public endpoints**, add `GET, POST` on `/submit`.

Use the exact path `/submit`. The rule `/submit/*` covers paths below it but does not include the form itself.

## Try it

1. Open the root in a signed out browser and confirm Tokay asks you to sign in. Then open `/submit` without signing in.
2. Register a visit and check the confirmation page.
3. Sign in to the root, find the **Guest link** entry, then deploy again. The registration is still in the staff history.

The public rule covers `GET` and `POST` on `/submit`. The app still rejects every other method with `405`.

## How it works

You can safely expose the form because the server validates every field, limits dates, and assigns **Guest link** itself. The public request cannot choose another source.

SQLite keeps the history through deployments and restarts. A few fictional visits appear only when the database is empty. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) to see how Tokay protects the file.

Tokay checks the attached Groups before a request reaches Express. The public endpoint covers only `/submit`, while `/`, `/health`, and every other path remain Private.

## Secrets

There are no application secrets. Service access, its Groups, and the public endpoint are Tokay settings.

## Grow from here

Try the [private Streamlit support dashboard](../python-streamlit-support-dashboard) when coworkers need filters, charts, and editable notes.

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

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the app, make the Service Private for your staff, open the exact public path `/submit`, and prove that a guest registration survives another deployment.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, use the steps below to set access before sharing the URL.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, use the steps below to set access before sharing the URL.

## Keep the staff pages private

1. Make the Service **Private** with the switch beside its name.
2. Open the **Access** tab. Under **Who can open it**, add each staff email or your company email domain.
3. Under **Open without sign-in**, add the path `/submit`.

Use the exact path `/submit`. The rule `/submit/*` covers paths below it but does not include the form itself.

## Try it

1. Open the root in a signed out browser and confirm Tokay asks you to sign in. Then open `/submit` without signing in.
2. Register a visit and check the confirmation page.
3. Sign in to the root, find the **Guest link** entry, then deploy again. The registration is still in the staff history.

Anyone can reach `/submit` without signing in. The app itself accepts only `GET` and `POST` there and answers every other method with `405`.

## How it works

You can safely expose the form because the server validates every field, limits dates, and assigns **Guest link** itself. The public request cannot choose another source.

SQLite keeps the history through deployments and restarts. A few fictional visits appear only when the database is empty. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) to see how Tokay protects the file.

Tokay checks who is signed in before a request reaches Express. The public endpoint covers only `/submit`, while `/`, `/health`, and every other path remain Private.

## Secrets

There are no application secrets. Service access and the path open without sign-in are Tokay settings.

## Grow from here

Try the [private Streamlit support dashboard](../python-streamlit-support-dashboard) when coworkers need filters, charts, and editable notes.

# PHP PostgreSQL guestbook

A PHP guestbook collects names and notes, shows every message with its time, and keeps them through new deployments. Tokay runs the page as one Web Service with a managed PostgreSQL database.

Start here when you want saved data without bringing in a full PHP framework. The page, form handling, and database queries all live in `index.php`, so you can follow the complete request in one place.

## Guide and download

Read the full guide at https://tokay.io/examples/php-postgres-guestbook. You can also
download the complete project at
https://tokay.io/examples/downloads/php-postgres-guestbook.zip.

## What it does

The guestbook opens with a welcome note and a form for your name and message.

Press **Sign the book** and your entry appears at the top with a UTC timestamp. Refresh the page whenever you like and the database keeps it in place.

If either field is empty, the page explains what is missing instead of writing an incomplete entry.

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
5. Ask your agent to deploy the guestbook, confirm the suggested PostgreSQL database, and prove that a new note survives another deployment.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `index.php` and `.htaccess`, then choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Finish setup in Tokay

The guestbook needs PostgreSQL to keep its messages. Tokay has already prepared the database setup based on the app. You only need to confirm where `DATABASE_URL` should point.

1. Choose **Environment** from the guestbook Service.
2. Find `DATABASE_URL` under **From your databases**.
3. Choose **Confirm database**.
4. Keep the suggested `app` name.
5. Choose **Confirm**.

The guestbook is ready to deploy with `app` selected. Tokay creates the database and gives the private connection to the app. Choose **Go Live** if prompted, then open the guestbook from the Service's live URL.

## Try it

1. Sign the book and refresh the page to confirm your note is still there.
2. Change a piece of page copy, then deploy again.
3. Open the updated page. Your note is still there because PostgreSQL lives beyond the app release.

## How it works

The app creates the table on its first database connection, then uses prepared statements for every submitted message. Tokay supplies the private PostgreSQL connection through `DATABASE_URL`, so its password never appears in your code.

## Secrets

You do not need to create a secret. Tokay supplies `DATABASE_URL` when you confirm the managed PostgreSQL database.

## Grow from here

Try the [Laravel event space booking app](../php-laravel-postgres-event-space-booking) when you want a full framework, migrations, and scheduled reminders.

# Movie watchlist with React, Express, and PostgreSQL

A React watchlist lets you plan movie and show nights through an Express JSON API backed by PostgreSQL. Tokay runs the frontend and API together as one Web Service.

The repository pairs a Vite client with an Express server, which is a common shape for AI generated React apps with a backend. Tokay detects both parts and deploys them together.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-vite-react-express-postgres-watchlist. You can also
download the complete project at
https://tokay.io/examples/downloads/node-vite-react-express-postgres-watchlist.zip.

## What it does

The page shows a list of movies and shows that you can scroll, search by title, and filter by mood.

You can switch the view between waiting, watched, and all. A live count shows how many titles are waiting.

When you finish watching something, choose **Mark watched**. A watched title can be moved back to the planning list later.

You can add your own titles with a format and a mood, and they appear in the list right away.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the watchlist, confirm the suggested PostgreSQL database, and prove that a new recommendation survives another deployment.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

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

The watchlist needs PostgreSQL to keep your recommendations. Open **Environment**, find `DATABASE_URL` under **From your databases**, and choose **Confirm database**. Keep `app`, then choose **Confirm**.

Database setup for the watchlist is complete after its Service connects to `app`. Tokay tests the database migration against a copy before release. Choose **Go live** if prompted. When the Service is live, open the watchlist from its URL.

## Try it

1. Search for `moon`, choose **space**, then switch between **waiting** and **watched**.
2. Add a recommendation of your own.
3. Update the code as you like and deploy again. Your addition is still there because it was saved in your app's database.

## How it works

The Express server serves both the React page and the JSON API from one address. When you mark a title watched, the page calls the API and the API updates a row in PostgreSQL. Refresh or redeploy and your list looks the same, because the data lives in the database instead of the app.

Tokay creates the PostgreSQL database after you confirm the connection detected in the code. It rehearses the migration against a copy before production and runs it during deployment. The app then adds a few starting titles so your first visit is not an empty page.

## Secrets

This example needs none. Tokay supplies `DATABASE_URL` when you confirm the managed PostgreSQL database.

## Grow from here

Try the [task tracker](../node-express-postgres-task-tracker) when you want a smaller interface and more API examples.

# Node Vite React Express PostgreSQL watchlist

A watchlist app for planning movie and show nights, with a React interface over an Express JSON API. It runs on Tokay as one Web Service. Your list lives in a PostgreSQL database, so it survives every redeploy.

The repository has a Vite client and an Express server, a common and performant web architecture. If you asked an AI to build you a website with a backend, you would probably get something close to this. Tokay recognizes the two halves and deploys them together, so you never wire them up yourself.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-vite-react-express-postgres-watchlist. You can also
download the complete project at
https://tokay.io/examples/downloads/node-vite-react-express-postgres-watchlist.zip.

## What it does

The page shows a list of movies and shows that you can scroll, search by title, and filter by mood.

You can switch the view between waiting, watched, and all. A live count shows how many titles are waiting.

When you finish watching something, press Mark watched. Changed your mind? Put it back.

You can add your own titles with a format and a mood, and they appear in the list right away.

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
5. Ask your agent to deploy the watchlist, confirm the suggested PostgreSQL database, and prove that a new recommendation survives another deployment.

Never put the Tokay API token in this folder or in the deployed app.

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

The watchlist needs PostgreSQL to keep your recommendations. Open **Environment**, find `DATABASE_URL` under **From your infrastructure**, and choose **Confirm database**. Keep `app`, then choose **Confirm**.

When `DATABASE_URL` says **Good to go**, follow the deployment tracker. Tokay tests the database migration against a copy before release. If **Go Live** appears, choose it. When the Service status says **Live**, click the live URL in the top section to open the watchlist.

## Try it

1. Search for `moon`, choose **space**, then switch between **waiting** and **watched**.
2. Add a recommendation of your own.
3. Update the code as you like and deploy again. Your addition is still there because it was saved in your app's database.

## How it works

The Express server serves both the React page and the JSON API from one address. When you mark a title watched, the page calls the API and the API updates a row in PostgreSQL. Refresh or redeploy and your list looks the same, because the data lives in the database instead of the app.

Wondering where the database comes from? Tokay creates it for you. It recognizes the migration file in this code, tests it on a copy of your database before touching the real one, and runs it during the deploy. The app then adds a few starting titles so your first visit is not an empty page.

## Secrets

This example needs none. Tokay supplies `DATABASE_URL` when you confirm the managed PostgreSQL database.

## Grow from here

Try the [task tracker](../node-express-postgres-task-tracker) when you want a smaller interface and more API examples.

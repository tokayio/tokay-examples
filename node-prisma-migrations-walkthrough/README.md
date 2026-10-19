# Node Prisma migrations walkthrough

A newsletter signup app walks one PostgreSQL database through an additive Prisma change and a populated table drop without losing the subscriber list. Tokay runs it as one Web Service and rehearses each migration against a copy of your data first.

Use this walkthrough when you want to see the difference between a routine schema update and a release that deserves a human decision. Three Git tags hold the versions, and the setup below turns them into three commits in one standalone repository.

The download contains the final version for inspection. Start the full walkthrough with the Git setup below so you can deploy all three versions in order.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-prisma-migrations-walkthrough. You can also download
the complete project at
https://tokay.io/examples/downloads/node-prisma-migrations-walkthrough.zip.

## What it does

The **Field Notes** page collects a name and email, rejects duplicate addresses, and lists the people already reading.

The second version adds **Confirm signup** beside each unconfirmed reader. Your existing names remain while the new field begins empty.

The final version removes page visit tracking as a privacy cleanup. The page keeps subscriber and confirmation data because those records live in a different table.

## Prepare the walkthrough repository

The Tokay examples repository contains many apps. Extract this example at `v1` into its own repository before you push it, so Tokay sees only the newsletter app.

```sh
git clone https://github.com/tokayio/tokay-examples.git tokay-examples-source
mkdir prisma-walkthrough
git -C tokay-examples-source archive v1 node-prisma-migrations-walkthrough \
  | tar -x -C prisma-walkthrough --strip-components=1
git -C prisma-walkthrough init -b main
git -C prisma-walkthrough add README.md package.json prisma.config.ts prisma src tsconfig.json
git -C prisma-walkthrough commit -m "Start newsletter signups"
```

Keep `tokay-examples-source` beside `prisma-walkthrough`. The later steps copy `v2-additive` and `v3-destructive` from that clone.

## Deploy with your agent

If your client supports remote MCP, connect it to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the browser sign in,
and ask your agent to deploy this folder without pasting a token. Otherwise,
follow the API token steps below.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **You**, then **API & MCP tokens**, and choose **New token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this guide and the Tokay examples GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to prepare the standalone repository above, deploy its `v1` commit with one Service, Project, and database, then wait while you add a signup. After that, have your agent apply the remaining versions as described below. Keep migration safety on Normal through `v2-additive`, change it to Strict before `v3-destructive`, and stop at `CONFIRM_RELEASE` to show you the rehearsal result.

Never put the Tokay API token in this repository or in the deployed app.

## Paste or upload the first version

Paste or upload is a quick way to try the prepared `v1` folder, but it cannot carry the walkthrough through later commits. To see all three database changes on one Service, start with Git in the next section.

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload the prepared `prisma-walkthrough` folder and choose **Analyze**.
3. Review the detected Web Service, choose a Project, then choose **Go live**.
4. On the Service page, open **Environment**. Find `DATABASE_URL` under **From your databases**, choose **Confirm database**, keep `app`, then choose **Confirm**.
5. After connecting the Service to the `app` database, continue the deployment and choose **Go live** if prompted.

## Start the walkthrough with v1

1. From the prepared `prisma-walkthrough` repository, choose **Add code**, then **Git** in Tokay.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push the `v1` commit to the remote shown in those instructions.

```sh
git push tokay main
```

4. Choose **Configure service**. Choose a Project, then choose **Go live**.
5. Open the walkthrough Service's **Environment** page. Confirm the `app` database for `DATABASE_URL`.
6. Continue the deployment and choose **Go live** if prompted.

## Try it

1. Open **Field Notes** and add yourself. From `prisma-walkthrough`, replace its files with the additive version, commit them, and push.

```sh
git -C ../tokay-examples-source archive v2-additive node-prisma-migrations-walkthrough \
  | tar -x --strip-components=1
git add README.md package.json prisma.config.ts prisma src tsconfig.json
git commit -m "Add signup confirmation"
git push tokay main
```

Confirm your existing signup after the safe migration goes live.

2. Open Project **Settings** and change **Migration Safety** to **Strict**. Replace the files with the destructive version, commit them, and push.

```sh
git -C ../tokay-examples-source archive v3-destructive node-prisma-migrations-walkthrough \
  | tar -x --strip-components=1
git add README.md package.json prisma.config.ts prisma src tsconfig.json
git commit -m "Remove page visit tracking"
git push tokay main
```

3. Choose **Review release** and inspect the populated `public.PageVisit` drop. Apply it with downtime, then reopen **Field Notes** and confirm your signup is still present. In a production Project, the release also shows its restore point under **Database snapshots**.

Your agent sees the same stop as `ACTION_REQUIRED` with action `CONFIRM_RELEASE`. They must show you the rehearsal evidence and wait for your decision.

## What protects your data

The Prisma migration files stay with the code, but each change is tested against a copy of your data before production. This lets you see what the migration will do with the data shape you actually have.

The `v2-additive` migration only adds a nullable field. Under Normal mode, the successful rehearsal lets this release continue automatically.

Before `v3-destructive`, you change **Migration Safety** to **Strict**. The rehearsal finds a populated table drop and pauses the release. Your production database has not changed at this point.

If you confirm, Tokay takes a restorable production snapshot, applies the migration during the stated downtime window, and starts the new version. The snapshot gives you an explicit recovery option if the result is not what you expected.

## How it works

The newsletter page lets you create and confirm signups while Prisma stores them in PostgreSQL. One fictional signup appears only when the list is empty, so it does not return after you add real data.

Every database shape is committed under `prisma/migrations`. The three Git tags let the same app and database move through a safe additive change and a deliberate destructive change.

You may notice a placeholder URL in `prisma.config.ts`. Prisma 7 requires a URL while generating the client, even though that step never connects to a database. Migrations and the running app always receive the real `DATABASE_URL` from Tokay.

## Secrets

You do not need to create a secret. Tokay supplies `DATABASE_URL` from the managed PostgreSQL database you confirm.

## Grow from here

Try the [Streamlit support dashboard](../python-streamlit-support-dashboard) when you want a private team app in front of managed data.

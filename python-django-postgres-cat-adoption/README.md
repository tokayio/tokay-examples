# Python Django PostgreSQL cat adoption

A cat adoption directory lets visitors search by name or temperament, browse shelter rooms, and compare each cat's status and personality. Tokay runs the Django project as one Web Service with PostgreSQL.

This is a regular Django project with templates, static styles, models, migrations, and optional admin access. Tokay handles those familiar pieces together, so you do not need a separate asset service or database process.

## Guide and download

Read the full guide at
https://tokay.io/examples/python-django-postgres-cat-adoption. You can also download
the complete project at
https://tokay.io/examples/downloads/python-django-postgres-cat-adoption.zip.

## What it does

The directory introduces every cat with an age, temperament, room, adoption status, and a short note from the shelter.

Search for a name or a quality such as `calm`. Use **Sunroom**, **Library**, **Garden room**, or **Quiet room** to browse one part of the shelter.

The optional Django admin lets your team change a cat's details and status. Visitors see those updates as soon as they return to the directory.

## Generate the required secret

Generate a value on your own computer.

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Keep the value ready for the setup step after Tokay creates the Service. Do not put it in this folder.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask your agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token and `SECRET_KEY` in their secret store, start at step 3.

1. In Tokay, open **Account**, then **Platform tokens**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store beside the `SECRET_KEY` you generated.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the directory, use the `SECRET_KEY`, confirm the suggested PostgreSQL database, and verify search.

Never put either secret in this folder or in the deployed source.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Complete the secret and database steps below so the deployment can continue.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Complete the secret and database steps below so the deployment can continue.

## Finish setup in Tokay

Choose **Environment** on the directory Service.

1. Under **From your code**, find `SECRET_KEY`. Choose **Set shared value**, paste the value you generated, and save it. Future deployments will use the same encrypted Project Secret.
2. Find `DATABASE_URL` under **From your infrastructure**. Confirm the database, leave `app` as its name, and save the choice.
3. Check that both rows say **Good to go**, then complete the deployment tracker. Use **Go Live** if prompted. The finished Service's live URL opens the directory.

## Try it

1. Search for `calm`, then open the **Library** room.
2. Deploy the same code again after the directory is live.
3. Repeat the search. The cats and their adoption status remain in PostgreSQL.

## Turn on the admin

Open the Service's **Environment** page. Find `ADMIN_PASSWORD` under **From your code**, choose **Set shared value**, then deploy again. Sign in at `/admin/` with username `shelter-admin` and the password you set. Change a cat's status, then return to the directory to see the update.

You choose the admin password. The app never generates or prints one in the logs.

## How it works

Want to know where the directory comes from? A Django migration defines the database and a small seed step adds or updates the fictional cats. Tokay tests `python manage.py migrate --noinput` against a copy before the new version receives traffic.

Your CSS stays in Django's normal static file layout. Tokay collects and serves it with the directory, so the live page and its assets ship together.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `SECRET_KEY` | Yes | Signs Django sessions and security tokens. Store it as an encrypted Project Secret. |
| `ADMIN_PASSWORD` | No | Creates or updates the opt in `shelter-admin` account. |

## Grow from here

Try the [Streamlit support dashboard](../python-streamlit-support-dashboard) when the app is only for your own team.

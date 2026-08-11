# PHP Laravel PostgreSQL event space booking

An event space site lets visitors compare rooms, reserve a future time, and avoid conflicting bookings. Tokay runs the Laravel page as a Web Service and checks upcoming reminders with a Scheduled Service.

This project has the shape of a real app with public requests and scheduled work over one PostgreSQL database. Tokay recognizes both entry points and lets them share the database and encrypted Laravel key inside one Project.

## Guide and download

Read the full guide at
https://tokay.io/examples/php-laravel-postgres-event-space-booking. You can also
download the complete project at
https://tokay.io/examples/downloads/php-laravel-postgres-event-space-booking.zip.

## What it does

The public page introduces three rooms with their capacity, description, and hourly price.

Choose a room, start time, duration, and purpose, then press **Confirm booking**. The page saves valid requests and tells you when someone already holds an overlapping time.

The optional **Upcoming bookings** page gives staff a private list. The reminder Service records bookings due within 24 hours and can send email when you add SMTP settings.

## Generate the required secret

Generate a value on your own computer.

```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Keep the value ready for the setup step after Tokay creates both Services. Do not put it in this folder.

## Deploy with your agent

If your client supports remote MCP, connect it to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the browser sign in,
and ask your agent to deploy this folder without pasting a token. Otherwise,
follow the API token steps below.

If your agent already has a Tokay API token and `APP_KEY` in their secret store, start at step 3.

1. In Tokay, open **You**, then **API & MCP tokens**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store beside the `APP_KEY` you generated.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy both Services in one Project, schedule reminders with `0 * * * *` in your timezone, set the shared `APP_KEY`, and confirm the `app` database for both Services.

Never put either secret in this folder or in the deployed source.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**. Tokay detects one Web Service in `web` and one Scheduled Service in `reminders`.
3. Enter `every hour` in the reminder Service's **Schedule** field and check that the upcoming runs match your timezone.
4. Select both candidates, choose one Project, then choose **Deploy 2 Services**.

## Push with Git

1. Choose **Add code**, then **Git**.
2. Create a repository, follow the Git setup commands shown by Tokay, and push this folder.
3. Set the reminder schedule to `every hour` and check the upcoming runs in your timezone.
4. Select both detected candidates, choose one Project, then choose **Deploy 2 Services**.

## Finish setup in Tokay

On the Project page, choose **Environment**. Find the `APP_KEY` setup item, choose **Set value**, paste the value you generated, and save it. Both Services will use this same encrypted value.

Next, open each Service's **Environment** page. Under **From your infrastructure**, find `DATABASE_URL`, choose **Confirm database**, keep `app`, then choose **Confirm**. Do this for both Services so each one receives the same Project resource and logical database.

After saving `APP_KEY` and connecting both Services to the `app` database, continue the deployment and choose **Go Live** if prompted. When the Web Service is live, open the booking page from its URL.

## Try it

1. Book the **Workshop** room, then try to reserve an overlapping time. The second request is rejected.
2. Open the reminder Service and choose **Run Now** twice. The first run records a due reminder and the second skips the duplicate.
3. Deploy again and return to the booking site. Your original reservation is still present.

## Turn on staff and email features

Set `ADMIN_PASSWORD` under **From your code** on the Web Service's **Environment** page, then deploy the Web Service again. Open `/admin/bookings` and enter the password to see upcoming names, rooms, and times.

The Scheduled Service records reminders in its run history by default. To send real email, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM` under **From your code** on its **Environment** page. Add a booking due within 24 hours, then choose **Run Now**.

## How it works

Both Services use the same booking database, while only the Web Service owns the Laravel migrations. Tokay tests `php artisan migrate --force` against a copy before the site receives traffic, while the reminder job connects without trying to own the schema.

A database lock lets only one overlapping request win for a room and time. The reminder command records each notification before optional email delivery, so the next hourly run can safely skip it.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `APP_KEY` | Yes | Encrypts Laravel application values. Share one Project value with both Services. |
| `ADMIN_PASSWORD` | No | Opens the staff booking list on the Web Service. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM` | No | Sends real reminder email from the Scheduled Service. |

## Grow from here

Try the [daily sales report](../python-postgres-daily-sales-report) when a scheduled job should create something people revisit.

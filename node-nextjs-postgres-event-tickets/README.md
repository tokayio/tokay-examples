# Node Next.js PostgreSQL event tickets

A workshop ticket site shows live availability, accepts orders for up to six seats, and issues a ticket code after checkout. Tokay runs the Next.js app as one Web Service with PostgreSQL, so orders and seat counts survive every deployment.

You can try the complete experience without opening a payment account. The built in free test mode follows the same order and ticket path, while optional Stripe test keys let you connect a real hosted checkout later.

## Guide and download

Read the full guide at
https://tokay.io/examples/node-nextjs-postgres-event-tickets. You can also download
the complete project at
https://tokay.io/examples/downloads/node-nextjs-postgres-event-tickets.zip.

## What it does

The event page shows the workshop date, venue, price, and current number of seats left.

Use the minus and plus buttons to choose between one and six seats. Press **Complete free test order** and the next page gives you a ticket code with your reservation details.

When Stripe test mode is connected, the button changes to **Continue to Stripe test checkout**. The app waits for Stripe's signed confirmation before it issues that ticket.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the ticket app, confirm the suggested PostgreSQL database, and verify one free test order.

Stripe test checkout is optional, and the steps below add it. Never put Stripe keys in this folder.

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

The ticket app needs PostgreSQL to keep orders and ticket codes. Open **Environment** and find `DATABASE_URL` under **From your databases**. Confirm the suggested database, leave its name as `app`, and finish with **Confirm**.

After connecting the Service to the `app` database, continue the deployment and choose **Go live** if prompted. The live URL at the top of the finished Service opens the event page.

## Try it

1. Choose two seats and press **Complete free test order**.
2. Save the ticket page URL, then deploy the same code again.
3. Open that URL. Your ticket code is still available, and the event page still counts both seats.

## Add Stripe test checkout

Use the live Service URL that already works in free test mode.

1. Create a Stripe test mode secret key.
2. In Stripe, add a test webhook endpoint using your live URL followed by `/api/stripe/webhook`.
3. Subscribe that endpoint to `checkout.session.completed`, then copy the webhook signing secret Stripe creates for it.
4. Open the Service's **Environment** page. Find `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` under **From your code**.
5. Choose **Set value** for each one, paste the matching value, and save it.
6. Deploy the Service again.

The checkout button will now open Stripe in test mode. Complete a payment with a Stripe test card, then return to the ticket page. The app waits for Stripe's signed confirmation before issuing the ticket.

## How it works

You get a current seat count in the first page response because Next.js reads PostgreSQL on the server. The browser handles quantity changes and starts checkout, while the database keeps each order and ticket code.

Drizzle keeps the schema with the source. Tokay rehearses its committed migration before applying it. Free test orders complete in one transaction, while Stripe orders remain pending until a valid signed webhook arrives.

## Secrets

| Name | Required | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | No | Enables Stripe test checkout when the webhook secret is also set. |
| `STRIPE_WEBHOOK_SECRET` | No | Verifies Stripe completion events before a ticket is issued. |

## Grow from here

Try the [PostgreSQL task tracker](../node-express-postgres-task-tracker) when you want a smaller app with a detailed JSON API.

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
5. Ask your agent to deploy the ticket app, confirm the suggested PostgreSQL database, and verify one free test order.

Never put the Tokay API token or Stripe keys in this folder.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Tokay opens the new Service page. Complete the database step below so the deployment can continue.

## Finish setup in Tokay

The ticket app needs PostgreSQL to keep orders and ticket codes. Open **Environment** and find `DATABASE_URL` under **From your infrastructure**. Confirm the suggested database, leave its name as `app`, and finish with **Confirm**.

After connecting the Service to the `app` database, continue the deployment and choose **Go Live** if prompted. The live URL at the top of the finished Service opens the event page.

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
5. Choose **Set shared value** for each one, paste the matching value, and save it.
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

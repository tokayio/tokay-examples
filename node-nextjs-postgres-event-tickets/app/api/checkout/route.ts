import { randomUUID } from "crypto";
import Stripe from "stripe";
import { pool } from "../../../db/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const input = await request.json().catch(() => null);
  const quantity = Number(input?.quantity);
  if (!input?.eventId || !Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
    return Response.json({ error: "Choose between one and six tickets." }, { status: 400 });
  }
  const eventResult = await pool.query("SELECT id, name, price_cents FROM events WHERE id = $1", [input.eventId]);
  const event = eventResult.rows[0];
  if (!event) return Response.json({ error: "That event was not found." }, { status: 404 });

  const orderId = randomUUID();
  const amountCents = event.price_cents * quantity;
  // Stripe is optional. Without both secrets, checkout completes as a free test order.
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
  if (!stripeKey || !webhookSecret) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO orders (id, event_id, quantity, amount_cents, status, checkout_provider) VALUES ($1, $2, $3, $4, 'paid', 'simulated')",
        [orderId, event.id, quantity, amountCents],
      );
      await client.query(
        "INSERT INTO tickets (id, order_id, code) VALUES ($1, $2, $3)",
        [randomUUID(), orderId, `BOOK-${randomUUID().slice(0, 8).toUpperCase()}`],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return Response.json({ url: `/tickets/${orderId}` });
  }

  await pool.query(
    "INSERT INTO orders (id, event_id, quantity, amount_cents, status, checkout_provider) VALUES ($1, $2, $3, $4, 'pending', 'stripe')",
    [orderId, event.id, quantity, amountCents],
  );
  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity,
      price_data: {
        currency: "usd",
        unit_amount: event.price_cents,
        product_data: { name: event.name },
      },
    }],
    metadata: { orderId },
    success_url: `${origin}/tickets/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: origin,
  });
  await pool.query("UPDATE orders SET stripe_session_id = $1 WHERE id = $2", [session.id, orderId]);
  return Response.json({ url: session.url });
}

import { randomUUID } from "crypto";
import Stripe from "stripe";
import { pool } from "../../../../db/client";

export async function POST(request: Request) {
  // Both values are optional because the app has a complete free test order mode.
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
  if (!stripeKey || !webhookSecret) return new Response("Stripe test mode is not configured.", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Stripe signature missing.", { status: 400 });

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return new Response("Stripe signature invalid.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
        await client.query(
          "INSERT INTO tickets (id, order_id, code) VALUES ($1, $2, $3) ON CONFLICT (order_id) DO NOTHING",
          [randomUUID(), orderId, `BOOK-${randomUUID().slice(0, 8).toUpperCase()}`],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
  }
  return Response.json({ received: true });
}

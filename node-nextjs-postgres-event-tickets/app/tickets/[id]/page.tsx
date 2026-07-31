import Link from "next/link";
import { pool } from "../../../db/client";

export const dynamic = "force-dynamic";

type TicketRow = {
  order_id: string;
  quantity: number;
  amount_cents: number;
  status: string;
  checkout_provider: string;
  code: string | null;
  name: string;
  venue: string;
  starts_at: Date;
};

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await pool.query<TicketRow>(`
    SELECT o.id AS order_id, o.quantity, o.amount_cents, o.status, o.checkout_provider,
           t.code, e.name, e.venue, e.starts_at
    FROM orders o
    JOIN events e ON e.id = o.event_id
    LEFT JOIN tickets t ON t.order_id = o.id
    WHERE o.id = $1
  `, [id]);
  const ticket = result.rows[0];
  if (!ticket) return <main className="ticket"><h1>Ticket not found</h1><Link href="/">Return to the workshop</Link></main>;
  if (ticket.status !== "paid" || !ticket.code) {
    return <main className="ticket"><p className="kicker">Payment pending</p><h1>Your ticket is almost ready.</h1><p>Stripe has not confirmed this test payment yet. Refresh after the webhook arrives.</p></main>;
  }
  return (
    <main className="ticket">
      <p className="kicker">You have a place at the table</p>
      <h1>{ticket.name}</h1>
      <div className="ticket-code"><span>Ticket code</span><strong>{ticket.code}</strong></div>
      <p>{ticket.quantity} {ticket.quantity === 1 ? "seat" : "seats"} at {ticket.venue}</p>
      <p>{new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short", timeZone: "America/New_York" }).format(ticket.starts_at)}</p>
      <p className="mode">{ticket.checkout_provider === "simulated" ? "Completed in free test order mode." : "Completed through Stripe test mode."}</p>
      <Link href="/">Back to the event</Link>
    </main>
  );
}

import { pool } from "../db/client";
import { Checkout } from "./checkout";

export const dynamic = "force-dynamic";

type EventRow = {
  id: string;
  name: string;
  description: string;
  venue: string;
  starts_at: Date;
  price_cents: number;
  capacity: number;
  sold: string;
};

export default async function EventPage() {
  const result = await pool.query<EventRow>(`
    SELECT e.*, COALESCE(SUM(CASE WHEN o.status = 'paid' THEN o.quantity ELSE 0 END), 0)::text AS sold
    FROM events e
    LEFT JOIN orders o ON o.event_id = e.id
    GROUP BY e.id
    ORDER BY e.starts_at
    LIMIT 1
  `);
  const event = result.rows[0];
  if (!event) return <main className="empty">The workshop is being prepared. Refresh in a moment.</main>;
  const date = new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short", timeZone: "America/New_York" }).format(event.starts_at);
  const seatsLeft = event.capacity - Number(event.sold);
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

  return (
    <main>
      <div className="paper" aria-hidden="true"><span>fold</span><span>stitch</span><span>case</span></div>
      <article>
        <p className="kicker">One afternoon workshop</p>
        <h1>{event.name}</h1>
        <p className="lede">{event.description}</p>
        <dl>
          <div><dt>When</dt><dd>{date}</dd></div>
          <div><dt>Where</dt><dd>{event.venue}</dd></div>
          <div><dt>Seats left</dt><dd>{seatsLeft} of {event.capacity}</dd></div>
        </dl>
      </article>
      <Checkout eventId={event.id} priceCents={event.price_cents} stripeReady={stripeReady} />
      <p className="ssr-proof">Rendered from PostgreSQL on the server.</p>
    </main>
  );
}

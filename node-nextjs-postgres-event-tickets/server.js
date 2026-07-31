const next = require("next");
const { createServer } = require("http");
const { Pool } = require("pg");

const eventId = "e09c2c50-8dd6-4f20-83e3-24c0b6c7c012";

async function seedEvent() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(
      `INSERT INTO events (id, name, description, venue, starts_at, price_cents, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         venue = EXCLUDED.venue,
         starts_at = EXCLUDED.starts_at,
         price_cents = EXCLUDED.price_cents,
         capacity = EXCLUDED.capacity`,
      [
        eventId,
        "Make a Book by Hand",
        "Spend one generous afternoon folding, stitching, and casing a clothbound notebook. Materials, tea, and a patient first lesson are included.",
        "North Window Workshop",
        "2026-10-17T18:00:00.000Z",
        4800,
        120,
      ],
    );
  } finally {
    await pool.end();
  }
}

async function start() {
  await seedEvent();
  const app = next({ dev: false });
  const handle = app.getRequestHandler();
  await app.prepare();
  const port = Number(process.env.PORT || 3000);
  createServer((request, response) => handle(request, response)).listen(port, "0.0.0.0", () => {
    console.log(`Event tickets ready on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Event tickets could not start", error);
  process.exit(1);
});

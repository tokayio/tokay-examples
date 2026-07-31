const crypto = require('crypto');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

const text = (value, maximum) => String(value || '').trim().slice(0, maximum);
const routeLead = (service, notes) => {
  const content = `${service} ${notes}`.toLowerCase();
  if (/urgent|repair|broken|today|emergency/.test(content)) return 'priority';
  if (/wedding|party|festival|event/.test(content)) return 'events';
  return 'general';
};

app.post('/submit', async (request, response) => {
  const lead = {
    name: text(request.body.name, 100),
    email: text(request.body.email, 200),
    service: text(request.body.service, 120),
    notes: text(request.body.notes, 2000),
  };
  if (!lead.name || !lead.email.includes('@') || !lead.service) {
    return response.status(400).json({ error: 'name, a valid email, and service are required' });
  }

  const suppliedKey = text(request.get('x-dedupe-key'), 160);
  const dedupeKey = suppliedKey || crypto.createHash('sha256').update(JSON.stringify(lead)).digest('hex');
  const routeKey = routeLead(lead.service, lead.notes);
  const result = await pool.query(
    `insert into lead_requests (dedupe_key, name, email, service, notes, route_key)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (dedupe_key) do update
       set duplicate_count = lead_requests.duplicate_count + 1
     returning id, route_key, duplicate_count, received_at`,
    [dedupeKey, lead.name, lead.email, lead.service, lead.notes, routeKey],
  );
  const saved = result.rows[0];
  console.log(JSON.stringify({
    event: 'lead.accepted',
    leadId: String(saved.id),
    route: saved.route_key,
    duplicate: saved.duplicate_count > 0,
  }));
  response.json({
    accepted: true,
    leadId: String(saved.id),
    route: saved.route_key,
    duplicate: saved.duplicate_count > 0,
  });
});

app.use((_request, response) => {
  response.status(405).json({ error: 'Send a POST request to /submit.' });
});

app.listen(port, '0.0.0.0', () => console.log(`Lead receiver listening on ${port}`));

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

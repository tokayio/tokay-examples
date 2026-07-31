const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const archiveRoot = process.env.TOKAY_DATA_DIR || path.join(__dirname, 'data');
const deliveryUrl = process.env.ALERT_WEBHOOK_URL;

const run = async () => {
  const result = await pool.query(
    `select id, name, email, service, notes, route_key, received_at
     from lead_requests
     where received_at >= now() - interval '24 hours'
     order by route_key, received_at`,
  );
  const counts = { priority: 0, events: 0, general: 0 };
  for (const lead of result.rows) counts[lead.route_key] += 1;

  const lines = [
    `Yesterday's leads: ${result.rowCount} total`,
    `Priority ${counts.priority} | Events ${counts.events} | General ${counts.general}`,
    ...result.rows.map(lead => `#${lead.id} [${lead.route_key}] ${lead.name} needs ${lead.service}`),
  ];
  const summary = lines.join('\n');
  const archive = {
    generatedAt: new Date().toISOString(),
    windowHours: 24,
    counts,
    leads: result.rows.map(lead => ({ ...lead, id: String(lead.id) })),
  };

  await fs.mkdir(archiveRoot, { recursive: true });
  const filename = `lead-digest-${new Date().toISOString().replaceAll(':', '-')}.json`;
  await fs.writeFile(path.join(archiveRoot, filename), `${JSON.stringify(archive, null, 2)}\n`);
  console.log(summary);
  console.log(`Archived ${filename}`);

  if (deliveryUrl) {
    const response = await fetch(deliveryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: summary }),
    });
    if (!response.ok) throw new Error(`Digest delivery returned HTTP ${response.status}`);
    console.log('Delivered the digest webhook.');
  }
};

run()
  .catch((error) => {
    console.error('Lead digest failed.', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

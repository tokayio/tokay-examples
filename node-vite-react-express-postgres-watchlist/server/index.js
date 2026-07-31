const path = require('path');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 3000);
const formats = new Set(['movie', 'show']);
const tags = new Set(['comfort', 'mystery', 'space', 'family', 'documentary']);
const seeds = [
  ['glass-orchard', 'The Glass Orchard', 'movie', 'mystery', false],
  ['night-bus', 'Night Bus to Bellwether', 'show', 'comfort', true],
  ['small-moons', 'A Field Guide to Small Moons', 'movie', 'space', false],
  ['soup-weather', 'Soup Weather', 'show', 'comfort', false],
  ['borrowed-light', 'Borrowed Light', 'movie', 'family', true],
  ['quiet-antenna', 'The Quiet Antenna', 'show', 'space', false],
  ['paper-kingdom', 'Paper Kingdom', 'movie', 'family', false],
  ['third-stair', 'The Third Stair', 'show', 'mystery', true],
  ['river-listens', 'When the River Listens', 'movie', 'documentary', false],
  ['kites', 'Kites Over Marrow Bay', 'movie', 'comfort', true],
  ['deep-catalog', 'The Deep Catalog', 'show', 'documentary', false],
  ['blue-hour', 'Blue Hour Detectives', 'show', 'mystery', false],
  ['sun-room', 'Everyone in the Sun Room', 'movie', 'family', false],
  ['tin-can', 'Tin Can Constellations', 'movie', 'space', true],
  ['last-seed', 'The Last Seed Library', 'show', 'documentary', false],
];

app.use(express.json({ limit: '32kb' }));

const toTitle = (row) => ({
  id: String(row.id),
  title: row.title,
  format: row.format,
  tag: row.tag,
  watched: row.watched,
});

async function seed() {
  for (const [seedKey, title, format, tag, watched] of seeds) {
    await pool.query(
      `insert into watchlist_titles (seed_key, title, format, tag, watched)
       values ($1, $2, $3, $4, $5)
       on conflict (seed_key) do nothing`,
      [seedKey, title, format, tag, watched],
    );
  }
}

app.get('/health', async (_request, response) => {
  await pool.query('select 1');
  response.json({ ok: true });
});

app.get('/api/titles', async (request, response) => {
  const values = [];
  const conditions = [];
  if (request.query.search) {
    values.push(`%${String(request.query.search).slice(0, 80)}%`);
    conditions.push(`title ilike $${values.length}`);
  }
  if (request.query.tag) {
    if (!tags.has(request.query.tag)) return response.status(400).json({ error: 'Unknown tag.' });
    values.push(request.query.tag);
    conditions.push(`tag = $${values.length}`);
  }
  if (request.query.watched === 'true' || request.query.watched === 'false') {
    values.push(request.query.watched === 'true');
    conditions.push(`watched = $${values.length}`);
  }
  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const result = await pool.query(
    `select id, title, format, tag, watched from watchlist_titles ${where}
     order by watched, added_at desc, id desc`,
    values,
  );
  response.json(result.rows.map(toTitle));
});

app.post('/api/titles', async (request, response) => {
  const title = String(request.body.title || '').trim();
  const format = String(request.body.format || 'movie');
  const tag = String(request.body.tag || 'comfort');
  if (!title || title.length > 120) return response.status(400).json({ error: 'Title must be between 1 and 120 characters.' });
  if (!formats.has(format)) return response.status(400).json({ error: 'Format must be movie or show.' });
  if (!tags.has(tag)) return response.status(400).json({ error: 'Choose a known tag.' });
  const result = await pool.query(
    `insert into watchlist_titles (title, format, tag)
     values ($1, $2, $3)
     returning id, title, format, tag, watched`,
    [title, format, tag],
  );
  response.status(201).json(toTitle(result.rows[0]));
});

app.patch('/api/titles/:id', async (request, response) => {
  if (typeof request.body.watched !== 'boolean') return response.status(400).json({ error: 'watched must be true or false.' });
  const result = await pool.query(
    `update watchlist_titles set watched = $1 where id = $2
     returning id, title, format, tag, watched`,
    [request.body.watched, request.params.id],
  );
  if (!result.rowCount) return response.status(404).json({ error: 'Title not found.' });
  response.json(toTitle(result.rows[0]));
});

const clientRoot = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientRoot));
app.use((request, response, next) => {
  if (request.method !== 'GET') return next();
  response.sendFile(path.join(clientRoot, 'index.html'));
});

seed()
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`Lantern watchlist listening on ${port}`)))
  .catch((error) => {
    console.error('The watchlist could not start.', error.message);
    process.exit(1);
  });

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

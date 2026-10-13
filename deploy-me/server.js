const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const bootedAt = new Date();
const dataDir = process.env.TOKAY_DATA_DIR || path.join(__dirname, 'data');

fs.mkdirSync(dataDir, { recursive: true });

const database = new DatabaseSync(path.join(dataDir, 'guestbook.sqlite'));
database.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const entryCount = database.prepare('SELECT COUNT(*) AS count FROM entries').get().count;
if (entryCount === 0) {
  database.prepare('INSERT INTO entries (name, message) VALUES (?, ?)')
    .run('Your host', 'Welcome. Leave a note for the next visitor.');
}

app.use(express.urlencoded({ extended: false }));

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const page = ({ error = '', draft = {} } = {}) => {
  const entries = database.prepare(`
    SELECT id, name, message, created_at
    FROM entries
    ORDER BY id DESC
  `).all();

  const cards = entries.map((entry) => `
    <article class="entry">
      <p>${escapeHtml(entry.message)}</p>
      <footer>${escapeHtml(entry.name)} · ${escapeHtml(entry.created_at)} UTC</footer>
    </article>
  `).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The guestbook</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #20201e; background: #f5f0e8; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    main { width: min(720px, calc(100% - 2rem)); margin: 0 auto; padding: 4rem 0; }
    h1 { margin: 0; font-family: Georgia, serif; font-size: clamp(2.6rem, 8vw, 5rem); font-weight: 500; letter-spacing: -0.04em; }
    .lede { color: #635f56; font-size: 1.1rem; margin: 0.7rem 0 2.5rem; }
    form, .entry { background: #fffdf8; border: 1px solid #d9d0c2; border-radius: 12px; }
    form { display: grid; gap: 0.9rem; padding: 1.25rem; margin-bottom: 2rem; }
    label { display: grid; gap: 0.35rem; font-size: 0.85rem; font-weight: 700; }
    input, textarea, button { font: inherit; }
    input, textarea { width: 100%; border: 1px solid #bcb2a3; border-radius: 7px; padding: 0.75rem; background: #fff; }
    textarea { min-height: 7rem; resize: vertical; }
    button { justify-self: start; border: 0; border-radius: 7px; padding: 0.7rem 1rem; color: #fff; background: #20201e; cursor: pointer; }
    .error { margin: 0; color: #a01933; }
    .count { color: #635f56; font-size: 0.9rem; }
    .entries { display: grid; gap: 0.8rem; }
    .entry { padding: 1.1rem 1.25rem; }
    .entry p { margin: 0 0 0.75rem; white-space: pre-wrap; }
    .entry footer { color: #777065; font-size: 0.8rem; }
    .boot { margin-top: 2.5rem; color: #777065; font-size: 0.8rem; }
  </style>
</head>
<body>
  <main>
    <h1>The guestbook</h1>
    <p class="lede">Leave a note for whoever arrives next.</p>
    <form action="/sign" method="post">
      ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
      <label>Your name<input name="name" maxlength="60" required value="${escapeHtml(draft.name || '')}"></label>
      <label>Your note<textarea name="message" maxlength="500" required>${escapeHtml(draft.message || '')}</textarea></label>
      <button type="submit">Sign the book</button>
    </form>
    <p class="count">${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}</p>
    <section class="entries">${cards}</section>
    <p class="boot">This version started ${escapeHtml(bootedAt.toUTCString())}</p>
  </main>
</body>
</html>`;
};

app.get('/health', (_request, response) => response.json({ ok: true }));

app.get('/', (_request, response) => response.type('html').send(page()));

app.post('/sign', (request, response) => {
  const name = String(request.body.name || '').trim();
  const message = String(request.body.message || '').trim();

  if (!name || !message) {
    return response.status(400).type('html').send(page({
      error: 'Add your name and a note.',
      draft: { name, message },
    }));
  }

  database.prepare('INSERT INTO entries (name, message) VALUES (?, ?)')
    .run(name.slice(0, 60), message.slice(0, 500));
  return response.redirect(303, '/');
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Guestbook listening on port ${port}`);
});

const shutdown = () => server.close(() => {
  database.close();
  process.exit(0);
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

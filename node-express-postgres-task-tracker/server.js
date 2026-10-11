const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 3000);

const tags = new Set(['permits', 'kitchen', 'marketing']);
const statuses = new Set(['todo', 'doing', 'done']);
// Due dates are days from the first launch, so the starter board always
// looks like a launch in progress.
const seedTasks = [
  ['county-permit', 'Submit county food permit', 'permits', 7, 'doing'],
  ['fire-review', 'Book fire safety review', 'permits', 11, 'todo'],
  ['vendor-license', 'Confirm street vendor license', 'permits', 14, 'todo'],
  ['taco-test', 'Finish smoked mushroom taco test', 'kitchen', -5, 'done'],
  ['cooler', 'Buy the service line cooler', 'kitchen', -1, 'doing'],
  ['allergen-card', 'Print the allergen reference card', 'kitchen', 1, 'todo'],
  ['supplier-call', 'Confirm first produce delivery', 'kitchen', 3, 'todo'],
  ['menu-board', 'Approve the opening menu board', 'marketing', -3, 'done'],
  ['photo-day', 'Shoot menu photos at golden hour', 'marketing', 5, 'todo'],
  ['map-listing', 'Publish the weekly stop map', 'marketing', 9, 'todo'],
  ['opening-flyer', 'Send the opening day flyer', 'marketing', 15, 'todo'],
  ['friends-preview', 'Invite neighbors to the preview night', 'marketing', 17, 'todo'],
];

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false }));

const cleanTask = (input, partial = false) => {
  const task = {};
  if (!partial || input.title !== undefined) {
    task.title = String(input.title || '').trim();
    if (!task.title || task.title.length > 120) throw new Error('Title must be between 1 and 120 characters.');
  }
  if (!partial || input.tag !== undefined) {
    task.tag = String(input.tag || '');
    if (!tags.has(task.tag)) throw new Error('Tag must be permits, kitchen, or marketing.');
  }
  if (!partial || input.dueDate !== undefined) {
    task.dueDate = String(input.dueDate || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) throw new Error('Due date must use YYYY-MM-DD.');
  }
  if (!partial || input.status !== undefined) {
    task.status = String(input.status || 'todo');
    if (!statuses.has(task.status)) throw new Error('Status must be todo, doing, or done.');
  }
  return task;
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const formatDate = (value) => value instanceof Date
  ? value.toISOString().slice(0, 10)
  : String(value).slice(0, 10);

const toTask = (row) => ({
  id: String(row.id),
  title: row.title,
  tag: row.tag,
  dueDate: formatDate(row.due_date),
  status: row.status,
});

async function seed() {
  for (const [seedKey, title, tag, dueInDays, status] of seedTasks) {
    await pool.query(
      `insert into launch_tasks (seed_key, title, tag, due_date, status)
       values ($1, $2, $3, current_date + $4::int, $5)
       on conflict (seed_key) do nothing`,
      [seedKey, title, tag, dueInDays, status],
    );
  }
}

app.get('/health', async (_request, response) => {
  await pool.query('select 1');
  response.json({ ok: true });
});

app.get('/api/tasks', async (request, response) => {
  const page = Math.max(1, Number.parseInt(request.query.page || '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(request.query.pageSize || '10', 10) || 10));
  const values = [];
  const conditions = [];

  if (request.query.status) {
    if (!statuses.has(request.query.status)) return response.status(400).json({ error: 'Unknown status.' });
    values.push(request.query.status);
    conditions.push(`status = $${values.length}`);
  }
  if (request.query.tag) {
    if (!tags.has(request.query.tag)) return response.status(400).json({ error: 'Unknown tag.' });
    values.push(request.query.tag);
    conditions.push(`tag = $${values.length}`);
  }
  if (request.query.search) {
    values.push(`%${String(request.query.search).slice(0, 80)}%`);
    conditions.push(`title ilike $${values.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const count = await pool.query(`select count(*)::int as total from launch_tasks ${where}`, values);
  values.push(pageSize, (page - 1) * pageSize);
  const result = await pool.query(
    `select id, title, tag, due_date, status
     from launch_tasks ${where}
     order by due_date, id
     limit $${values.length - 1} offset $${values.length}`,
    values,
  );
  const total = count.rows[0].total;
  response.json({
    tasks: result.rows.map(toTask),
    page: { number: page, size: pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
});

app.post('/api/tasks', async (request, response) => {
  try {
    const task = cleanTask(request.body);
    const result = await pool.query(
      `insert into launch_tasks (title, tag, due_date, status)
       values ($1, $2, $3, $4)
       returning id, title, tag, due_date, status`,
      [task.title, task.tag, task.dueDate, task.status],
    );
    response.status(201).json(toTask(result.rows[0]));
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id', async (request, response) => {
  try {
    const updates = cleanTask(request.body, true);
    const entries = Object.entries(updates);
    if (!entries.length) return response.status(400).json({ error: 'Send at least one task field.' });
    const columns = { title: 'title', tag: 'tag', dueDate: 'due_date', status: 'status' };
    const values = entries.map(([, value]) => value);
    const set = entries.map(([key], index) => `${columns[key]} = $${index + 1}`);
    values.push(request.params.id);
    const result = await pool.query(
      `update launch_tasks set ${set.join(', ')}, updated_at = now()
       where id = $${values.length}
       returning id, title, tag, due_date, status`,
      values,
    );
    if (!result.rowCount) return response.status(404).json({ error: 'Task not found.' });
    response.json(toTask(result.rows[0]));
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (request, response) => {
  const result = await pool.query('delete from launch_tasks where id = $1', [request.params.id]);
  if (!result.rowCount) return response.status(404).json({ error: 'Task not found.' });
  response.status(204).end();
});

app.get('/', async (_request, response) => {
  const result = await pool.query(
    `select id, title, tag, due_date, status from launch_tasks
     order by case status when 'doing' then 0 when 'todo' then 1 else 2 end, due_date, id`,
  );
  const cards = result.rows.map((row) => `
    <article class="task" data-tag="${row.tag}" data-status="${row.status}">
      <div><span class="tag ${row.tag}">${row.tag}</span><span class="status">${row.status}</span></div>
      <h2>${escapeHtml(row.title)}</h2>
      <p>Due ${formatDate(row.due_date)}</p>
      <div class="actions">
        <button data-action="advance" data-id="${row.id}" data-status="${row.status}">Move forward</button>
        ${row.seed_key ? '' : `<button data-action="delete" data-id="${row.id}">Remove</button>`}
      </div>
    </article>`).join('');

  response.type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Juniper Lunch Club launch board</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#203128;background:#f4f0e4}*{box-sizing:border-box}body{margin:0}.shell{max-width:1080px;margin:auto;padding:48px 24px 72px}header{display:flex;justify-content:space-between;gap:32px;align-items:end;margin-bottom:30px}.eyebrow,.tag{text-transform:uppercase;letter-spacing:.11em;font-size:.72rem;font-weight:800}.eyebrow{color:#b54a2c}h1{font-family:Georgia,serif;font-size:clamp(2.5rem,7vw,5.5rem);line-height:.92;margin:.18em 0}.count{font-size:1.05rem;max-width:22rem}.panel{background:#fffdf7;border:1px solid #d8d0bd;border-radius:20px;padding:20px;margin:24px 0}.filters,.new-task{display:flex;flex-wrap:wrap;gap:10px}input,select,button{font:inherit;border:1px solid #b9b09c;border-radius:9px;padding:10px 12px;background:white}input{flex:2;min-width:220px}button{cursor:pointer;font-weight:700;background:#203128;color:white;border-color:#203128}.board{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:14px}.task{background:#fffdf7;border:1px solid #d8d0bd;border-radius:16px;padding:18px;box-shadow:0 8px 26px #2031280d}.task h2{font-size:1.08rem;min-height:2.6em}.task p{color:#665f50}.tag{padding:5px 8px;border-radius:999px}.permits{background:#d8e9ef}.kitchen{background:#ffe2b8}.marketing{background:#ecd9e8}.status{float:right;color:#766d5c}.actions{display:flex;gap:8px}.actions button{padding:7px 9px;font-size:.84rem}.hidden{display:none}@media(max-width:650px){header{display:block}.new-task>*{width:100%}}
</style></head><body><main class="shell">
<header><div><div class="eyebrow">Juniper Lunch Club</div><h1>Opening day has a date.</h1></div><p class="count">${result.rowCount} moving pieces, one clear board. Get the permits, kitchen, and neighborhood ready together.</p></header>
<section class="panel filters"><input id="search" aria-label="Search tasks" placeholder="Search the board"><select id="tag"><option value="">Every team</option><option>permits</option><option>kitchen</option><option>marketing</option></select><select id="status"><option value="">Every status</option><option>todo</option><option>doing</option><option>done</option></select></section>
<section class="panel"><form class="new-task" id="new-task"><input name="title" required maxlength="120" placeholder="Add the next concrete step"><select name="tag"><option>permits</option><option>kitchen</option><option>marketing</option></select><input name="dueDate" required type="date"><button>Add task</button></form></section>
<section class="board" id="board">${cards}</section>
</main><script>
const filters = ['search','tag','status'].map(id => document.getElementById(id));
function filter(){const [search,tag,status]=filters.map(el=>el.value.toLowerCase());document.querySelectorAll('.task').forEach(card=>{const match=card.textContent.toLowerCase().includes(search)&&(!tag||card.dataset.tag===tag)&&(!status||card.dataset.status===status);card.classList.toggle('hidden',!match)})}filters.forEach(el=>el.addEventListener('input',filter));
document.getElementById('new-task').addEventListener('submit',async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));values.status='todo';const response=await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});if(response.ok)location.reload();else alert((await response.json()).error)});
document.getElementById('board').addEventListener('click',async event=>{const button=event.target.closest('button');if(!button)return;const id=button.dataset.id;if(button.dataset.action==='delete'){await fetch('/api/tasks/'+id,{method:'DELETE'})}else{const next={todo:'doing',doing:'done',done:'todo'}[button.dataset.status];await fetch('/api/tasks/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})})}location.reload()});
</script></body></html>`);
});

seed()
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`Launch board listening on ${port}`)))
  .catch((error) => {
    console.error('The launch board could not start.', error.message);
    process.exit(1);
  });

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const express = require('express');

const app = express();
const todos = [
  { id: 1, title: 'deploy this ✓' },
  { id: 2, title: 'add a database' },
  { id: 3, title: 'tell a friend' },
];

app.use(express.json());

app.get('/', (_request, response) => response.json({
  message: 'Hello from Express',
  runtime: `Node.js ${process.version}`,
}));

app.get('/health', (_request, response) => response.json({ ok: true }));

app.get('/todos', (_request, response) => response.json(todos));

app.post('/todos', (request, response) => {
  const title = String(request.body?.title || '').trim();
  if (!title) return response.status(400).json({ error: 'title is required' });

  const todo = { id: todos.at(-1)?.id + 1 || 1, title };
  todos.push(todo);
  return response.status(201).json(todo);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`Express API listening on port ${port}`));

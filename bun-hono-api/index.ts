import { Hono } from "hono";

const app = new Hono();
const todos = [
  { id: 1, title: "deploy this ✓" },
  { id: 2, title: "add a database" },
  { id: 3, title: "tell a friend" },
];

app.get("/", (context) => context.json({
  message: "Hello from Hono",
  runtime: `Bun ${Bun.version}`,
}));

app.get("/health", (context) => context.json({ ok: true }));

app.get("/todos", (context) => context.json(todos));

app.post("/todos", async (context) => {
  const input = await context.req.json<{ title?: string }>().catch(() => ({}));
  const title = String(input.title || "").trim();
  if (!title) return context.json({ error: "title is required" }, 400);

  const todo = { id: (todos.at(-1)?.id || 0) + 1, title };
  todos.push(todo);
  return context.json(todo, 201);
});

export default {
  port: Number(Bun.env.PORT || 3000),
  fetch: app.fetch,
};

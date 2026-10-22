import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import express, { type Request, type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";

type Identity = {
  id: string;
  email: string;
};

type TaskRow = {
  id: number;
  title: string;
  notes: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const dataDirectory = process.env.TOKAY_DATA_DIR || path.join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });
const database = new DatabaseSync(path.join(dataDirectory, "tasks.sqlite"));
database.exec("PRAGMA journal_mode = WAL;");
database.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    due_date TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS tasks_owner_due_date_idx
    ON tasks (owner_id, due_date);
`);

const identityFrom = (request: Request): Identity | null => {
  const type = request.header("X-Tokay-Actor-Type")?.toLowerCase();
  const id = request.header("X-Tokay-Actor-Id")?.trim();
  const email = request.header("X-Tokay-Actor-Email")?.trim();

  if (type !== "person" || !id || !email) return null;
  return { id, email };
};

const isCalendarDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};

const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine(isCalendarDate, "Use a real calendar date");

const taskIdSchema = z.number().int().positive();
const taskTitleSchema = z.string().trim().min(1).max(160);
const taskNotesSchema = z.string().trim().max(2000);

const presentTask = (task: TaskRow) => ({
  id: task.id,
  title: task.title,
  notes: task.notes,
  dueDate: task.due_date,
  status: task.completed_at ? "completed" : "open",
  completedAt: task.completed_at,
  createdAt: task.created_at,
  updatedAt: task.updated_at
});

const toolResult = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }]
});

const getTask = (id: number, ownerId: string) => database.prepare(`
  SELECT id, title, notes, due_date, completed_at, created_at, updated_at
  FROM tasks WHERE id = ? AND owner_id = ?
`).get(id, ownerId) as TaskRow | undefined;

const requireTask = (id: number, ownerId: string) => {
  const task = getTask(id, ownerId);
  if (!task) throw new Error(`Task ${id} was not found in your task list`);
  return task;
};

const createMcpServer = (identity: Identity) => {
  const server = new McpServer({ name: "personal-task-inbox", version: "1.0.0" });

  server.registerTool(
    "list_my_tasks",
    {
      title: "List my tasks",
      description: "List tasks owned by the signed-in person. Never returns another person's tasks.",
      inputSchema: {
        status: z.enum(["open", "completed", "all"]).default("open"),
        due_before: dateSchema.optional(),
        due_after: dateSchema.optional(),
        limit: z.number().int().min(1).max(100).default(50)
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ status, due_before, due_after, limit }) => {
      let query = `
        SELECT id, title, notes, due_date, completed_at, created_at, updated_at
        FROM tasks WHERE owner_id = ?
      `;
      const parameters: Array<string | number> = [identity.id];

      if (status === "open") query += " AND completed_at IS NULL";
      if (status === "completed") query += " AND completed_at IS NOT NULL";
      if (due_before) {
        query += " AND due_date <= ?";
        parameters.push(due_before);
      }
      if (due_after) {
        query += " AND due_date >= ?";
        parameters.push(due_after);
      }
      query += " ORDER BY completed_at IS NOT NULL, due_date IS NULL, due_date, created_at DESC LIMIT ?";
      parameters.push(limit);

      const tasks = database.prepare(query).all(...parameters) as TaskRow[];
      return toolResult({ owner: identity.email, tasks: tasks.map(presentTask) });
    }
  );

  server.registerTool(
    "create_task",
    {
      title: "Create task",
      description: "Create a task for the signed-in person.",
      inputSchema: {
        title: taskTitleSchema,
        notes: taskNotesSchema.optional(),
        due_date: dateSchema.optional()
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
    },
    async ({ title, notes, due_date }) => {
      const now = new Date().toISOString();
      const result = database.prepare(`
        INSERT INTO tasks (owner_id, title, notes, due_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(identity.id, title, notes ?? null, due_date ?? null, now, now);
      return toolResult(presentTask(requireTask(Number(result.lastInsertRowid), identity.id)));
    }
  );

  server.registerTool(
    "update_task",
    {
      title: "Update task",
      description: "Change the title, notes, or due date of one task owned by the signed-in person.",
      inputSchema: {
        id: taskIdSchema,
        title: taskTitleSchema.optional(),
        notes: taskNotesSchema.nullable().optional(),
        due_date: dateSchema.nullable().optional()
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ id, title, notes, due_date }) => {
      requireTask(id, identity.id);
      const assignments: string[] = [];
      const parameters: Array<string | number | null> = [];

      if (title !== undefined) {
        assignments.push("title = ?");
        parameters.push(title);
      }
      if (notes !== undefined) {
        assignments.push("notes = ?");
        parameters.push(notes);
      }
      if (due_date !== undefined) {
        assignments.push("due_date = ?");
        parameters.push(due_date);
      }
      if (assignments.length === 0) throw new Error("Provide a title, notes, or due_date to update");

      assignments.push("updated_at = ?");
      parameters.push(new Date().toISOString(), id, identity.id);
      database.prepare(`UPDATE tasks SET ${assignments.join(", ")} WHERE id = ? AND owner_id = ?`).run(...parameters);
      return toolResult(presentTask(requireTask(id, identity.id)));
    }
  );

  server.registerTool(
    "complete_task",
    {
      title: "Complete task",
      description: "Mark one task owned by the signed-in person as completed.",
      inputSchema: { id: taskIdSchema },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ id }) => {
      const task = requireTask(id, identity.id);
      if (!task.completed_at) {
        const now = new Date().toISOString();
        database.prepare("UPDATE tasks SET completed_at = ?, updated_at = ? WHERE id = ? AND owner_id = ?")
          .run(now, now, id, identity.id);
      }
      return toolResult(presentTask(requireTask(id, identity.id)));
    }
  );

  server.registerTool(
    "reopen_task",
    {
      title: "Reopen task",
      description: "Move one completed task owned by the signed-in person back to open.",
      inputSchema: { id: taskIdSchema },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async ({ id }) => {
      const task = requireTask(id, identity.id);
      if (task.completed_at) {
        database.prepare("UPDATE tasks SET completed_at = NULL, updated_at = ? WHERE id = ? AND owner_id = ?")
          .run(new Date().toISOString(), id, identity.id);
      }
      return toolResult(presentTask(requireTask(id, identity.id)));
    }
  );

  server.registerTool(
    "delete_task",
    {
      title: "Delete task",
      description: "Permanently delete one task owned by the signed-in person.",
      inputSchema: { id: taskIdSchema },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
    },
    async ({ id }) => {
      const task = requireTask(id, identity.id);
      database.prepare("DELETE FROM tasks WHERE id = ? AND owner_id = ?").run(id, identity.id);
      return toolResult({ deleted: true, task: presentTask(task) });
    }
  );

  return server;
};

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/mcp", async (request: Request, response: Response) => {
  const identity = identityFrom(request);
  if (!identity) {
    response.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Sign in with an approved Tokay visitor account to use this MCP server" },
      id: request.body?.id ?? null
    });
    return;
  }

  const server = createMcpServer(identity);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  response.on("close", () => {
    transport.close().catch(() => undefined);
    server.close().catch(() => undefined);
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(request, response, request.body);
  } catch (error) {
    console.error("MCP request failed", error);
    if (!response.headersSent) {
      response.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
    }
  }
});

const methodNotAllowed = (_request: Request, response: Response) => {
  response.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null });
};
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.get("/", (request, response) => {
  const identity = identityFrom(request);
  const identityMessage = identity
    ? `Signed in as <strong>${escapeHtml(identity.email)}</strong>. Your MCP client sees only this account's tasks.`
    : "Make this Service Private and allow your visitors to enable OAuth and per-person task lists.";

  response.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your own remote MCP server with OAuth</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f6f0e8; color: #28231e; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    main { width: min(960px, calc(100% - 36px)); margin: 50px auto 84px; }
    header { padding: 42px; border-radius: 28px; background: #3f3154; color: #fffaf4; box-shadow: 0 24px 70px rgba(55, 36, 72, .18); }
    .eyebrow { margin: 0 0 14px; color: #d9c9ed; font-size: .78rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
    h1 { margin: 0 0 16px; max-width: 800px; font: 500 clamp(2.5rem, 7vw, 5.4rem)/.98 Georgia, serif; }
    header > p:not(.eyebrow) { margin: 0; max-width: 700px; color: #e3dbe9; font-size: 1.08rem; line-height: 1.65; }
    .endpoint { display: flex; gap: 10px; margin-top: 26px; }
    code { font-family: ui-monospace, SFMono-Regular, monospace; overflow-wrap: anywhere; }
    .endpoint code { flex: 1; padding: 14px 16px; border: 1px solid #78698c; border-radius: 12px; background: #30243f; }
    button { border: 0; border-radius: 12px; padding: 0 18px; background: #f3ca69; color: #29231c; font: inherit; font-weight: 800; cursor: pointer; }
    section { margin-top: 28px; padding: 30px; border: 1px solid #ddd2c4; border-radius: 20px; background: #fffdf9; }
    h2 { margin: 0 0 10px; font-size: 1.4rem; }
    h3 { margin: 24px 0 8px; font-size: 1rem; }
    p, li { color: #655d54; line-height: 1.65; }
    pre { margin: 10px 0 0; padding: 16px; overflow: auto; border-radius: 12px; background: #26212d; color: #f5edf9; line-height: 1.5; }
    .identity { margin-top: 18px; padding: 13px 15px; border-left: 4px solid #f3ca69; border-radius: 8px; background: #4b3a61; color: #eee6f3; }
    .tools { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .tool { padding: 16px; border-radius: 14px; background: #f5f0e8; }
    .tool strong { display: block; margin-bottom: 4px; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .split div { padding: 18px; border-radius: 14px; background: #f5f0e8; }
    .split h3 { margin-top: 0; }
    @media (max-width: 680px) { main { margin-top: 18px; } header, section { padding: 24px 20px; } .endpoint { flex-direction: column; } button { min-height: 44px; } .tools, .split { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Remote MCP · Visitor OAuth · SQLite</p>
      <h1>Your own MCP server, with OAuth included.</h1>
      <p>Visitors connect from an MCP client, approve access with their email, and get a private task list. The app contains no OAuth routes, token storage, or identity form.</p>
      <div class="endpoint"><code id="endpoint"></code><button id="copy">Copy endpoint</button></div>
      <p class="identity">${identityMessage}</p>
    </header>

    <section>
      <h2>Connect Claude Code</h2>
      <p>Add the remote MCP endpoint, then start the OAuth sign in flow. Claude Code opens Tokay's consent page in your browser.</p>
      <pre><code id="claude-add"></code></pre>
      <pre><code>claude mcp login task-inbox</code></pre>
    </section>

    <section>
      <h2>Try the task tools</h2>
      <div class="tools">
        <div class="tool"><strong>create_task</strong><span>Add “Renew passport” due next Friday.</span></div>
        <div class="tool"><strong>list_my_tasks</strong><span>What do I need to finish this week?</span></div>
        <div class="tool"><strong>update_task</strong><span>Move the passport task to the end of the month.</span></div>
        <div class="tool"><strong>complete_task</strong><span>Mark the passport task complete.</span></div>
        <div class="tool"><strong>reopen_task</strong><span>Reopen the task I just completed.</span></div>
        <div class="tool"><strong>delete_task</strong><span>Delete task 3.</span></div>
      </div>
    </section>

    <section>
      <h2>Who owns authentication?</h2>
      <div class="split">
        <div><h3>Tokay</h3><p>Publishes MCP OAuth discovery, verifies visitor email, issues and refreshes tokens, asks for consent, and forwards trusted identity headers.</p></div>
        <div><h3>This app</h3><p>Uses the stable visitor ID to isolate rows in SQLite. Every query and mutation is scoped to the signed-in person.</p></div>
      </div>
    </section>
  </main>
  <script>
    const endpoint = location.origin + '/mcp';
    document.querySelector('#endpoint').textContent = endpoint;
    document.querySelector('#claude-add').textContent = 'claude mcp add --transport http task-inbox ' + endpoint;
    document.querySelector('#copy').addEventListener('click', async event => {
      await navigator.clipboard.writeText(endpoint);
      event.currentTarget.textContent = 'Copied';
    });
  </script>
</body>
</html>`);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`OAuth task inbox MCP server listening on ${port}`);
});

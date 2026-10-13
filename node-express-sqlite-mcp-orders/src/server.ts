import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import express, { type Request, type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";

const dataDirectory = process.env.TOKAY_DATA_DIR || path.join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });
const database = new DatabaseSync(path.join(dataDirectory, "orders.sqlite"));
database.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
database.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    ordered_at TEXT NOT NULL,
    status TEXT NOT NULL,
    total_cents INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL
  );
`);

const customerSeed = [
  ["Maya Chen", "maya@example.test", "Portland"],
  ["Jon Bell", "jon@example.test", "Richmond"],
  ["Nia Okafor", "nia@example.test", "Detroit"],
  ["Rosa Alvarez", "rosa@example.test", "Tucson"],
  ["Eli Martin", "eli@example.test", "Madison"],
  ["Priya Shah", "priya@example.test", "Sacramento"],
  ["Theo Brooks", "theo@example.test", "Providence"],
  ["Amara Reed", "amara@example.test", "Baltimore"]
] as const;

const productSeed = [
  ["Cedar desk tray", 4200],
  ["Linen notebook", 1800],
  ["Brass page clip", 1200],
  ["Wool cable wrap", 2400],
  ["Stoneware cup", 3200],
  ["Canvas pencil roll", 2800]
] as const;

const seedDatabase = () => {
  const existing = database.prepare("SELECT COUNT(*) AS count FROM customers").get() as { count: number };
  if (existing.count > 0) return;

  const insertCustomer = database.prepare("INSERT INTO customers (name, email, city) VALUES (?, ?, ?)");
  const insertOrder = database.prepare("INSERT INTO orders (customer_id, ordered_at, status, total_cents) VALUES (?, ?, ?, ?)");
  const insertItem = database.prepare("INSERT INTO order_items (order_id, product, quantity, unit_price_cents) VALUES (?, ?, ?, ?)");
  database.exec("BEGIN");
  try {
    for (const customer of customerSeed) insertCustomer.run(...customer);
    for (let index = 0; index < 54; index += 1) {
      const first = productSeed[index % productSeed.length];
      const second = productSeed[(index * 3 + 1) % productSeed.length];
      const firstQuantity = (index % 3) + 1;
      const secondQuantity = index % 4 === 0 ? 2 : 1;
      const totalCents = first[1] * firstQuantity + second[1] * secondQuantity;
      const orderedAt = new Date(Date.now() - index * 40 * 60 * 60 * 1000).toISOString();
      const status = index % 11 === 0 ? "refunded" : index % 5 === 0 ? "processing" : "fulfilled";
      const order = insertOrder.run((index % customerSeed.length) + 1, orderedAt, status, totalCents);
      insertItem.run(order.lastInsertRowid, first[0], firstQuantity, first[1]);
      insertItem.run(order.lastInsertRowid, second[0], secondQuantity, second[1]);
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
};

seedDatabase();

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const toolResult = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }]
});

const createMcpServer = () => {
  const server = new McpServer({ name: "shop-orders", version: "1.0.0" });

  server.registerTool(
    "sales_summary",
    {
      title: "Sales summary",
      description: "Summarize order revenue and volume over a recent number of days.",
      inputSchema: { days: z.number().int().min(1).max(90).default(7) },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ days }) => {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const row = database.prepare(`
        SELECT COUNT(*) AS orders, COALESCE(SUM(total_cents), 0) AS revenue_cents,
               COALESCE(ROUND(AVG(total_cents)), 0) AS average_cents
        FROM orders WHERE ordered_at >= ? AND status != 'refunded'
      `).get(cutoff) as { orders: number; revenue_cents: number; average_cents: number };
      return toolResult({
        period: `Last ${days} days`,
        orders: row.orders,
        revenue: money(row.revenue_cents),
        averageOrder: money(row.average_cents)
      });
    }
  );

  server.registerTool(
    "find_customer",
    {
      title: "Find customer",
      description: "Find customers by name or email and include their order history totals.",
      inputSchema: { query: z.string().trim().min(2).max(80) },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ query }) => {
      const rows = database.prepare(`
        SELECT c.id, c.name, c.email, c.city, COUNT(o.id) AS order_count,
               COALESCE(SUM(CASE WHEN o.status != 'refunded' THEN o.total_cents ELSE 0 END), 0) AS spend_cents
        FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
        WHERE c.name LIKE ? COLLATE NOCASE OR c.email LIKE ? COLLATE NOCASE
        GROUP BY c.id ORDER BY spend_cents DESC LIMIT 10
      `).all(`%${query}%`, `%${query}%`) as Array<Record<string, string | number>>;
      return toolResult(rows.map(row => ({ ...row, spend: money(Number(row.spend_cents)) })));
    }
  );

  server.registerTool(
    "recent_orders",
    {
      title: "Recent orders",
      description: "Return the newest orders with customer and line item detail.",
      inputSchema: { limit: z.number().int().min(1).max(25).default(10) },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ limit }) => {
      const orders = database.prepare(`
        SELECT o.id, o.ordered_at, o.status, o.total_cents, c.name AS customer, c.city
        FROM orders o JOIN customers c ON c.id = o.customer_id
        ORDER BY o.ordered_at DESC LIMIT ?
      `).all(limit) as Array<{ id: number; ordered_at: string; status: string; total_cents: number; customer: string; city: string }>;
      const itemQuery = database.prepare("SELECT product, quantity, unit_price_cents FROM order_items WHERE order_id = ? ORDER BY id");
      return toolResult(orders.map(order => ({
        id: order.id,
        orderedAt: order.ordered_at,
        status: order.status,
        total: money(order.total_cents),
        customer: order.customer,
        city: order.city,
        items: itemQuery.all(order.id)
      })));
    }
  );

  server.registerTool(
    "top_products",
    {
      title: "Top products",
      description: "Rank products by units sold and revenue over a recent number of days.",
      inputSchema: {
        days: z.number().int().min(1).max(90).default(30),
        limit: z.number().int().min(1).max(10).default(5)
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ days, limit }) => {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const rows = database.prepare(`
        SELECT i.product, SUM(i.quantity) AS units,
               SUM(i.quantity * i.unit_price_cents) AS revenue_cents
        FROM order_items i JOIN orders o ON o.id = i.order_id
        WHERE o.ordered_at >= ? AND o.status != 'refunded'
        GROUP BY i.product ORDER BY revenue_cents DESC LIMIT ?
      `).all(cutoff, limit) as Array<{ product: string; units: number; revenue_cents: number }>;
      return toolResult(rows.map(row => ({ product: row.product, units: row.units, revenue: money(row.revenue_cents) })));
    }
  );

  return server;
};

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post("/mcp", async (request: Request, response: Response) => {
  const server = createMcpServer();
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

app.get("/", (_request, response) => {
  response.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Private sales analytics for a headless AI agent</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f1f4f0; color: #202820; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    main { width: min(940px, calc(100% - 36px)); margin: 56px auto 90px; }
    header { padding: 38px; border-radius: 26px; background: #173f35; color: #f7fbf7; }
    h1 { margin: 0 0 14px; max-width: 760px; font: 500 clamp(2.4rem, 7vw, 5.2rem)/0.98 Georgia, serif; }
    header p { margin: 0; max-width: 650px; color: #c9ded5; font-size: 1.08rem; line-height: 1.6; }
    .endpoint { display: flex; gap: 10px; margin-top: 24px; }
    code { font-family: ui-monospace, SFMono-Regular, monospace; overflow-wrap: anywhere; }
    .endpoint code { flex: 1; padding: 13px 15px; border: 1px solid #668a7e; border-radius: 12px; background: #0f3028; }
    button { border: 0; border-radius: 12px; padding: 0 18px; background: #f0c96a; color: #222; font: inherit; font-weight: 700; cursor: pointer; }
    section { margin-top: 28px; padding: 28px 30px; border: 1px solid #ced8ce; border-radius: 20px; background: white; }
    h2 { margin: 0 0 12px; font-size: 1.35rem; }
    h3 { margin: 24px 0 8px; font-size: 1rem; }
    p, li { color: #556055; line-height: 1.6; }
    pre { margin: 10px 0 0; padding: 15px; overflow: auto; border-radius: 12px; background: #18211e; color: #e7f1eb; line-height: 1.5; }
    .tools { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
    .tool { padding: 16px; border-radius: 14px; background: #f4f6f1; }
    .tool strong { display: block; margin-bottom: 4px; }
    .note { border-left: 4px solid #c78c43; padding-left: 14px; }
    @media (max-width: 650px) { main { margin-top: 18px; } header, section { padding: 24px 20px; } .endpoint { flex-direction: column; } button { min-height: 44px; } .tools { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Private sales reports, ready for your agent.</h1>
      <p>This remote MCP server gives a headless agent four read only tools over a seeded 90 day order history. A Tokay Machine credential protects the endpoint, and the SQLite database stays with your Service.</p>
      <div class="endpoint"><code id="endpoint"></code><button id="copy">Copy endpoint</button></div>
    </header>

    <section>
      <h2>Connect a headless agent</h2>
      <p>Allow a Machine on this Service, make the Service Private, and pass the Machine credential as a bearer header.</p>
      <pre><code id="claude-private"></code></pre>
      <h3>Optional public smoke test</h3>
      <p>Before making the Service Private, you can verify the MCP handshake without a credential.</p>
      <pre><code id="claude-public"></code></pre>
    </section>

    <section>
      <h2>Check the public smoke test</h2>
      <p>While the Service is Public, list the tools with MCP Inspector. Then make it Private and use the Machine credential command above.</p>
      <pre><code id="inspector"></code></pre>
    </section>

    <section>
      <h2>Ask about the shop</h2>
      <div class="tools">
        <div class="tool"><strong>sales_summary</strong><span>How were sales last week?</span></div>
        <div class="tool"><strong>find_customer</strong><span>Find Maya and summarize her history.</span></div>
        <div class="tool"><strong>recent_orders</strong><span>Show the five newest orders.</span></div>
        <div class="tool"><strong>top_products</strong><span>What sold best this month?</span></div>
      </div>
    </section>

    <section>
      <h2>Why a Machine?</h2>
      <p class="note">This agent is automation, not a person. Its Machine provides a durable identity, and the credential works without an interactive sign in and can be revoked without changing anyone's account. Use per-person OAuth when an individual is authorizing their own MCP client.</p>
    </section>
  </main>
  <script>
    const endpoint = location.origin + '/mcp';
    document.querySelector('#endpoint').textContent = endpoint;
    document.querySelector('#claude-public').textContent = 'claude mcp add --transport http shop-orders ' + endpoint;
    document.querySelector('#claude-private').textContent = 'claude mcp add --transport http shop-orders ' + endpoint + ' --header "Authorization: Bearer <machine-credential>"';
    document.querySelector('#inspector').textContent = 'npx -y @modelcontextprotocol/inspector@latest --cli ' + endpoint + ' --transport http --method tools/list';
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
  console.log(`Shop orders MCP server listening on ${port}`);
});

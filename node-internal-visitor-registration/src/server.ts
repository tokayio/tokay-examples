import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import express, { type Request, type Response } from "express";

const app = express();
const port = Number(process.env.PORT || 3000);
const dataDirectory = process.env.TOKAY_DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(path.join(dataDirectory, "visitors.sqlite"));
database.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
database.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    guest_name TEXT NOT NULL,
    host_name TEXT NOT NULL,
    arrival_at TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS visits_arrival_at_idx ON visits (arrival_at);
`);

type Visit = {
  id: string;
  guest_name: string;
  host_name: string;
  arrival_at: string;
  source: string;
  created_at: string;
};

type FormValues = {
  guestName: string;
  hostName: string;
  arrivalAt: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

const dateKey = (date: Date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
);

const localDateTime = (date: Date) => `${dateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const shiftDate = (days: number, hour: number, minute = 0) => {
  const shifted = new Date();
  shifted.setDate(shifted.getDate() + days);
  shifted.setHours(hour, minute, 0, 0);
  return localDateTime(shifted);
};

const seedVisits = () => {
  const row = database.prepare("SELECT COUNT(*) AS count FROM visits").get() as { count: number };
  if (row.count > 0) return;

  const samples = [
    ["Mina Patel", "Devon Lee", shiftDate(0, 9, 30), "Host added"],
    ["Owen Brooks", "Priya Shah", shiftDate(0, 11), "Guest link"],
    ["Lucia Moreno", "Caleb Wright", shiftDate(0, 14, 15), "Front desk"],
    ["Noah Williams", "Mina Patel", shiftDate(1, 10), "Host added"],
    ["Aisha Grant", "Priya Shah", shiftDate(-1, 15, 30), "Guest link"],
    ["Theo Martin", "Devon Lee", shiftDate(-3, 9), "Front desk"],
    ["Hana Kim", "Caleb Wright", shiftDate(-6, 13, 45), "Host added"],
  ];
  const insert = database.prepare(`
    INSERT INTO visits (id, guest_name, host_name, arrival_at, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  database.exec("BEGIN");
  try {
    for (const sample of samples) {
      insert.run(crypto.randomUUID(), ...sample, new Date().toISOString());
    }
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
};

seedVisits();

const escapeHtml = (value: unknown) => {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  };
  return String(value).replace(/[&<>'"]/g, character => entities[character]);
};

const formatArrival = (arrivalAt: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(arrivalAt);
  if (!match) return arrivalAt;
  const [, year, month, day, hour, minute] = match;
  const instant = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(instant);
};

const page = (title: string, body: string, publicPage = false) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f4f0e8; color: #202b28; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    main { width: min(1080px, calc(100% - 36px)); margin: 0 auto; padding: 34px 0 80px; }
    nav { display: flex; justify-content: space-between; align-items: center; padding-bottom: 25px; border-bottom: 1px solid #cbc5ba; }
    nav strong { font: 600 1.1rem Georgia, serif; }
    nav span { color: #68716d; font-size: .84rem; }
    .hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 32px; align-items: end; padding: 66px 0 38px; }
    .eyebrow { margin: 0 0 10px; color: #a44d38; font-size: .72rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { max-width: 760px; margin: 0; font: 500 clamp(3rem, 8vw, 6rem)/.93 Georgia, serif; letter-spacing: -.045em; }
    .lede { max-width: 660px; margin: 19px 0 0; color: #5d6863; font-size: 1.08rem; line-height: 1.65; }
    .count { min-width: 180px; padding: 21px; border-radius: 18px; background: #214f43; color: white; }
    .count strong { display: block; font: 500 3rem Georgia, serif; }
    .section { margin-top: 24px; }
    .section h2 { margin: 0 0 15px; font: 600 1.35rem Georgia, serif; }
    .visits { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
    .visit { padding: 19px; border: 1px solid #d9d3c7; border-radius: 16px; background: #fffdf8; }
    .visit time { color: #a44d38; font-size: .77rem; font-weight: 800; text-transform: uppercase; }
    .visit h3 { margin: 10px 0 5px; font: 600 1.2rem Georgia, serif; }
    .visit p { margin: 4px 0; color: #65706b; }
    .source { display: inline-block; margin-top: 12px; padding: 5px 8px; border-radius: 999px; background: #e8eee9; color: #36554c; font-size: .75rem; font-weight: 750; }
    .table { overflow: auto; border: 1px solid #d9d3c7; border-radius: 16px; background: #fffdf8; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 14px 16px; border-bottom: 1px solid #e6e1d8; text-align: left; white-space: nowrap; }
    th { color: #68716d; font-size: .73rem; letter-spacing: .06em; text-transform: uppercase; }
    tr:last-child td { border-bottom: 0; }
    .form-shell { width: min(680px, calc(100% - 36px)); margin: 38px auto 70px; }
    .form-shell .hero { display: block; padding: 48px 0 30px; }
    .form-shell h1 { font-size: clamp(2.8rem, 9vw, 5.3rem); }
    form, .confirmation { padding: 28px; border: 1px solid #d9d3c7; border-radius: 20px; background: #fffdf8; box-shadow: 0 20px 55px #6e604d14; }
    label { display: block; margin: 18px 0 7px; font-size: .82rem; font-weight: 750; }
    label:first-child { margin-top: 0; }
    input, button { width: 100%; border-radius: 10px; font: inherit; }
    input { padding: 13px 14px; border: 1px solid #beb8ad; background: white; }
    input:focus { outline: 3px solid #c7d9d2; border-color: #315e52; }
    button { margin-top: 23px; padding: 14px 18px; border: 0; background: #214f43; color: white; font-weight: 800; cursor: pointer; }
    .error { margin: 0 0 18px; padding: 13px 14px; border-radius: 10px; background: #f9e5df; color: #7b2e20; }
    .fine { margin: 18px 0 0; color: #6b736f; font-size: .83rem; line-height: 1.55; }
    .confirmation h1 { font-size: clamp(2.4rem, 8vw, 4.3rem); }
    .confirmation p { color: #5d6863; font-size: 1.05rem; line-height: 1.65; }
    @media (max-width: 760px) { .hero { grid-template-columns: 1fr; padding-top: 42px; } .visits { grid-template-columns: 1fr; } .count { width: fit-content; } }
  </style>
</head>
<body class="${publicPage ? "public" : "internal"}">${body}</body>
</html>`;

const renderForm = (response: Response, values: FormValues, error = "", status = 200) => {
  const message = error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : "";
  response.status(status).send(page("Register your visit", `
    <main class="form-shell">
      <nav><strong>Northstar Studio</strong><span>Guest registration</span></nav>
      <section class="hero">
        <p class="eyebrow">Plan your arrival</p>
        <h1>We will let your host know you are coming.</h1>
        <p class="lede">Share the details below before you arrive. The front desk will have your visit ready.</p>
      </section>
      <form action="/submit" method="post">
        ${message}
        <label for="guestName">Your name</label>
        <input id="guestName" name="guestName" value="${escapeHtml(values.guestName)}" minlength="2" maxlength="80" autocomplete="name" required>
        <label for="hostName">Who are you meeting</label>
        <input id="hostName" name="hostName" value="${escapeHtml(values.hostName)}" minlength="2" maxlength="80" required>
        <label for="arrivalAt">Arrival time</label>
        <input id="arrivalAt" name="arrivalAt" type="datetime-local" value="${escapeHtml(values.arrivalAt)}" required>
        <button type="submit">Register visit</button>
        <p class="fine">This form records only the visit details you enter. Contact your host if your plans change.</p>
      </form>
    </main>
  `, true));
};

const validateForm = (body: Record<string, unknown>): { values: FormValues; error: string } => {
  const values = {
    guestName: String(body.guestName || "").trim().replace(/\s+/g, " "),
    hostName: String(body.hostName || "").trim().replace(/\s+/g, " "),
    arrivalAt: String(body.arrivalAt || "").trim(),
  };
  if (values.guestName.length < 2 || values.guestName.length > 80) {
    return { values, error: "Enter your name using 2 to 80 characters." };
  }
  if (values.hostName.length < 2 || values.hostName.length > 80) {
    return { values, error: "Enter the name of the person you are meeting." };
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(values.arrivalAt);
  if (!match) return { values, error: "Choose a valid arrival date and time." };
  const [, year, month, day, hour, minute] = match.map(String);
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
  const roundTrip = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  if (roundTrip !== values.arrivalAt) return { values, error: "Choose a valid arrival date and time." };
  const today = dateKey(new Date());
  const latest = new Date();
  latest.setDate(latest.getDate() + 180);
  const arrivalDay = values.arrivalAt.slice(0, 10);
  if (arrivalDay < today || arrivalDay > dateKey(latest)) {
    return { values, error: "Choose a visit from today through the next 180 days." };
  }
  return { values, error: "" };
};

app.disable("x-powered-by");
app.use((_request, response, next) => {
  response.set({
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  next();
});
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

app.get("/health", (_request, response) => response.json({ ok: true }));

app.get("/", (_request, response) => {
  const visits = database.prepare(`
    SELECT id, guest_name, host_name, arrival_at, source, created_at
    FROM visits
    ORDER BY arrival_at DESC, created_at DESC
  `).all() as unknown as Visit[];
  const today = dateKey(new Date());
  const expectedToday = visits.filter(visit => visit.arrival_at.startsWith(today));
  const cards = expectedToday.map(visit => `
    <article class="visit">
      <time>${escapeHtml(formatArrival(visit.arrival_at))}</time>
      <h3>${escapeHtml(visit.guest_name)}</h3>
      <p>Meeting ${escapeHtml(visit.host_name)}</p>
      <span class="source">${escapeHtml(visit.source)}</span>
    </article>
  `).join("");
  const rows = visits.map(visit => `
    <tr>
      <td>${escapeHtml(formatArrival(visit.arrival_at))}</td>
      <td>${escapeHtml(visit.guest_name)}</td>
      <td>${escapeHtml(visit.host_name)}</td>
      <td><span class="source">${escapeHtml(visit.source)}</span></td>
    </tr>
  `).join("");
  response.send(page("Visitor desk", `
    <main>
      <nav><strong>Northstar Studio</strong><span>Private front desk</span></nav>
      <section class="hero">
        <div>
          <p class="eyebrow">Visitor desk</p>
          <h1>Know who is walking in today.</h1>
          <p class="lede">A shared arrival list for the people welcoming guests. New registrations appear here as soon as they are submitted.</p>
        </div>
        <div class="count"><strong>${expectedToday.length}</strong><span>expected today</span></div>
      </section>
      <section class="section">
        <h2>Today's arrivals</h2>
        <div class="visits">${cards || '<p>No visitors are expected today.</p>'}</div>
      </section>
      <section class="section">
        <h2>Registration history</h2>
        <div class="table"><table>
          <thead><tr><th>Arrival</th><th>Guest</th><th>Host</th><th>Source</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </section>
    </main>
  `));
});

app.head("/submit", (_request, response) => response.status(405).set("Allow", "GET, POST").end());

app.get("/submit", (_request, response) => {
  renderForm(response, { guestName: "", hostName: "", arrivalAt: shiftDate(0, 10) });
});

app.post("/submit", (request: Request, response: Response) => {
  const { values, error } = validateForm(request.body as Record<string, unknown>);
  if (error) return renderForm(response, values, error, 400);
  database.prepare(`
    INSERT INTO visits (id, guest_name, host_name, arrival_at, source, created_at)
    VALUES (?, ?, ?, ?, 'Guest link', ?)
  `).run(crypto.randomUUID(), values.guestName, values.hostName, values.arrivalAt, new Date().toISOString());
  response.status(201).send(page("Visit registered", `
    <main class="form-shell">
      <nav><strong>Northstar Studio</strong><span>Guest registration</span></nav>
      <section class="confirmation">
        <p class="eyebrow">You are expected</p>
        <h1>We have your visit.</h1>
        <p>${escapeHtml(values.guestName)}, you are registered to meet ${escapeHtml(values.hostName)} on ${escapeHtml(formatArrival(values.arrivalAt))}.</p>
        <p>Your host or the front desk can help if your plans change.</p>
      </section>
    </main>
  `, true));
});

app.all("/submit", (_request, response) => {
  response.status(405).set("Allow", "GET, POST").type("text").send("Method not allowed\n");
});

app.use((_request, response) => response.status(404).type("text").send("Not found\n"));

app.use((error: unknown, _request: Request, response: Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).type("text").send("The request could not be completed.\n");
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Visitor registration ready on port ${port} with data in ${dataDirectory}`);
});

process.on("SIGTERM", () => server.close(() => {
  database.close();
  process.exit(0);
}));

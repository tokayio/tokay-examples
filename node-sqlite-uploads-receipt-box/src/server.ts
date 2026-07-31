import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import express from "express";
import multer from "multer";

const app = express();
const port = Number(process.env.PORT || 3000);
const dataDir = process.env.TOKAY_DATA_DIR || path.join(process.cwd(), "data");
const uploadsDir = path.join(dataDir, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const database = new Database(path.join(dataDir, "receipts.sqlite"));
database.pragma("journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    merchant TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    category TEXT NOT NULL,
    purchased_on TEXT NOT NULL,
    image_filename TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

const categories = ["Food", "Travel", "Supplies", "Software", "Other"];
const mimeExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

function escapeHtml(value: unknown) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  };
  return String(value).replace(/[&<>'"]/g, character => entities[character]);
}

function monthToday() {
  return new Date().toISOString().slice(0, 7);
}

function seedReceipts() {
  const seedMonth = monthToday();
  const day = Math.max(1, Math.min(Number(new Date().toISOString().slice(8, 10)), 12));
  const samples = [
    { id: "sample-market", merchant: "Green Basket Market", amount: 4080, category: "Food", day: Math.max(1, day - 4), filename: "sample-market.svg", asset: "market-receipt.svg" },
    { id: "sample-transit", merchant: "North City Transit", amount: 3200, category: "Travel", day, filename: "sample-transit.svg", asset: "transit-receipt.svg" },
  ];
  const insert = database.prepare(`
    INSERT OR IGNORE INTO receipts
      (id, merchant, amount_cents, category, purchased_on, image_filename, created_at)
    VALUES
      (@id, @merchant, @amount, @category, @purchasedOn, @filename, @createdAt)
  `);
  for (const sample of samples) {
    const target = path.join(uploadsDir, sample.filename);
    if (!fs.existsSync(target)) fs.copyFileSync(path.join(import.meta.dirname, "assets", sample.asset), target);
    insert.run({
      ...sample,
      purchasedOn: `${seedMonth}-${String(sample.day).padStart(2, "0")}`,
      createdAt: new Date().toISOString(),
    });
  }
}

seedReceipts();

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadsDir),
  filename: (_request, file, callback) => callback(null, `${crypto.randomUUID()}${mimeExtensions.get(file.mimetype)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => callback(null, mimeExtensions.has(file.mimetype)),
});

app.use(express.urlencoded({ extended: false }));
app.use("/receipt-images", express.static(uploadsDir, { fallthrough: false, maxAge: "1h" }));
app.get("/health", (_request, response) => response.json({ ok: true }));

app.get("/", (request, response) => {
  const requestedMonth = String(request.query.month || "");
  const month = /^\d{4}-\d{2}$/.test(requestedMonth) ? requestedMonth : monthToday();
  const receipts = database.prepare(`
    SELECT id, merchant, amount_cents, category, purchased_on, image_filename
    FROM receipts
    WHERE substr(purchased_on, 1, 7) = ?
    ORDER BY purchased_on DESC, created_at DESC
  `).all(month) as Array<Record<string, string | number>>;
  const total = receipts.reduce((sum, receipt) => sum + Number(receipt.amount_cents), 0);
  const cards = receipts.map(receipt => `
    <article>
      <a class="image" href="/receipt-images/${encodeURIComponent(String(receipt.image_filename))}"><img src="/receipt-images/${encodeURIComponent(String(receipt.image_filename))}" alt="Receipt from ${escapeHtml(receipt.merchant)}"></a>
      <div><p class="category">${escapeHtml(receipt.category)}</p><h2>${escapeHtml(receipt.merchant)}</h2><p>${escapeHtml(receipt.purchased_on)}</p></div>
      <strong>$${(Number(receipt.amount_cents) / 100).toFixed(2)}</strong>
    </article>
  `).join("");
  response.send(`<!doctype html>
    <html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Receipt Box</title>
    <style>
      :root{font-family:ui-sans-serif,system-ui,sans-serif;background:#f4f0e7;color:#202921}*{box-sizing:border-box}body{margin:0}header,main{width:min(1020px,calc(100% - 36px));margin:auto}header{padding:28px 0;border-bottom:1px solid #c8c1b5;display:flex;justify-content:space-between}header b{font:500 1.35rem Georgia,serif}.hero{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;padding:70px 0 45px}.eyebrow,.category{color:#8c543c;font-size:.72rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase}h1{max-width:670px;margin:8px 0 0;font:500 clamp(3rem,8vw,6.5rem)/.9 Georgia,serif;letter-spacing:-.05em}.total{text-align:right}.total strong{display:block;font:500 2.6rem Georgia,serif}.grid{display:grid;grid-template-columns:320px 1fr;gap:26px;padding-bottom:80px}.panel{padding:24px;border-radius:17px;background:#fffdf7;box-shadow:0 18px 45px #665b4812}.panel h2{font:500 1.7rem Georgia,serif}.field{display:block;margin:16px 0 7px;font-size:.78rem;font-weight:800}input,select,button{width:100%;padding:12px;border:1px solid #cfc6b6;border-radius:8px;background:white;font:inherit}button{margin-top:20px;border:0;background:#31594d;color:white;font-weight:800;cursor:pointer}.month{display:flex;gap:10px;margin-bottom:15px}.month button{width:auto;margin:0}.list{display:grid;gap:12px}article{display:grid;grid-template-columns:86px 1fr auto;gap:18px;align-items:center;padding:13px;border-radius:13px;background:#fffdf7}.image{width:86px;height:86px;border-radius:9px;overflow:hidden;background:#ddd6ca}.image img{width:100%;height:100%;object-fit:cover}article h2{margin:3px 0;font:500 1.35rem Georgia,serif}article p{margin:0;color:#6b706a}article>strong{font:500 1.4rem Georgia,serif}.empty{padding:50px;text-align:center;color:#6b706a;background:#fffdf7;border-radius:13px}@media(max-width:760px){.hero,.grid{grid-template-columns:1fr}.total{text-align:left}article{grid-template-columns:70px 1fr}.image{width:70px;height:70px}article>strong{grid-column:2}}
    </style></head><body><header><b>Receipt Box</b><span>Saved locally</span></header><main>
      <section class="hero"><div><p class="eyebrow">A calm place for the paper trail</p><h1>Receipts that stay put.</h1></div><div class="total"><span>${receipts.length} this month</span><strong>$${(total / 100).toFixed(2)}</strong></div></section>
      <div class="grid"><form class="panel" action="/receipts" method="post" enctype="multipart/form-data"><h2>Add a receipt</h2>
        <label class="field" for="merchant">Merchant</label><input id="merchant" name="merchant" maxlength="80" required>
        <label class="field" for="amount">Amount</label><input id="amount" name="amount" inputmode="decimal" placeholder="24.50" pattern="\\d+(\\.\\d{1,2})?" required>
        <label class="field" for="category">Category</label><select id="category" name="category">${categories.map(category => `<option>${category}</option>`).join("")}</select>
        <label class="field" for="date">Purchase date</label><input id="date" name="purchased_on" type="date" value="${new Date().toISOString().slice(0, 10)}" required>
        <label class="field" for="image">Photo or scan</label><input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" required>
        <button>Save receipt</button></form>
        <section><form class="month" method="get"><input aria-label="Month" name="month" type="month" value="${escapeHtml(month)}"><button>Show month</button></form><div class="list">${cards || '<p class="empty">No receipts in this month yet.</p>'}</div></section>
      </div></main></body></html>`);
});

app.post("/receipts", upload.single("image"), (request, response, next) => {
  try {
    if (!request.file) return response.status(400).send("Choose a JPEG, PNG, or WebP receipt image under 3 MB.");
    const merchant = String(request.body.merchant || "").trim();
    const amount = String(request.body.amount || "").trim();
    const category = String(request.body.category || "");
    const purchasedOn = String(request.body.purchased_on || "");
    const parsedDate = new Date(`${purchasedOn}T00:00:00Z`);
    const validDate = !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === purchasedOn;
    if (!merchant || merchant.length > 80 || !/^\d+(\.\d{1,2})?$/.test(amount) || !categories.includes(category) || !validDate) {
      fs.unlinkSync(request.file.path);
      return response.status(400).send("Check the merchant, amount, category, and purchase date.");
    }
    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isSafeInteger(amountCents) || amountCents < 1 || amountCents > 100_000_000) {
      fs.unlinkSync(request.file.path);
      return response.status(400).send("Enter an amount between 0.01 and 1,000,000.00.");
    }
    database.prepare(`
      INSERT INTO receipts (id, merchant, amount_cents, category, purchased_on, image_filename, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), merchant, amountCents, category, purchasedOn, request.file.filename, new Date().toISOString());
    response.redirect(303, `/?month=${encodeURIComponent(purchasedOn.slice(0, 7))}`);
  } catch (error) {
    if (request.file?.path && fs.existsSync(request.file.path)) fs.unlinkSync(request.file.path);
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return response.status(413).send("Keep the image under 3 MB.");
  response.status(500).send("The receipt could not be saved.");
});

const server = app.listen(port, "0.0.0.0", () => console.log(`Receipt Box ready on port ${port} with data in ${dataDir}`));
process.on("SIGTERM", () => server.close(() => { database.close(); process.exit(0); }));

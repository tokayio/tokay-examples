const crypto = require("node:crypto");
const { ZipArchive } = require("archiver");
const { Queue } = require("bullmq");
const { parse } = require("csv-parse/sync");
const express = require("express");
const IORedis = require("ioredis");
const multer = require("multer");

const redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue("statements", { connection: redis });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 256 * 1024 } });
const app = express();
const maxBatches = 8;

async function pruneBatches() {
  let count = await redis.zcard("statement:batches");
  if (count <= maxBatches) return;
  const oldestFirst = await redis.zrange("statement:batches", 0, -1);
  for (const batchId of oldestFirst) {
    if (count <= maxBatches) break;
    const metadata = await redis.hgetall(`statement:batch:${batchId}`);
    if (Number(metadata.completed) + Number(metadata.failed) !== Number(metadata.total)) continue;
    const keys = await redis.smembers(`statement:keys:${batchId}`);
    if (keys.length) await redis.del(...keys);
    await redis.del(`statement:keys:${batchId}`, `statement:batch:${batchId}`);
    await redis.zrem("statement:batches", batchId);
    count -= 1;
  }
}

function sampleCsv() {
  const names = ["Mira Chen", "Jon Bell", "Ada Evans", "Ravi Shah", "Nia Carter", "Luis Park", "Tess Morgan", "Omar Reed"];
  const rows = ["customer,email,period,balance_cents"];
  for (let index = 0; index < 40; index += 1) {
    const name = names[index % names.length];
    rows.push(`${name} ${Math.floor(index / names.length) + 1},customer${index + 1}@example.test,June 2026,${7400 + index * 315}`);
  }
  return `${rows.join("\n")}\n`;
}

app.get("/health", (_request, response) => response.json({ ok: true }));
app.get("/sample.csv", (_request, response) => {
  response.type("text/csv").attachment("sample-statements.csv").send(sampleCsv());
});

app.post("/batches", upload.single("statements"), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: "Choose a CSV file." });
    const records = parse(request.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
    if (!records.length || records.length > 200) return response.status(400).json({ error: "Include between 1 and 200 statement rows." });
    const rows = records.map((row, index) => {
      const balanceCents = Number(row.balance_cents);
      if (!row.customer || !row.email || !row.period || !Number.isInteger(balanceCents) || balanceCents < 0) {
        throw new Error(`Row ${index + 2} needs customer, email, period, and a whole nonnegative balance_cents value.`);
      }
      return { index, customer: row.customer, email: row.email, period: row.period, balanceCents };
    });
    const batchId = crypto.randomUUID();
    const metadataKey = `statement:batch:${batchId}`;
    const csvKey = `statement:csv:${batchId}`;
    await redis.hset(metadataKey, {
      id: batchId,
      total: rows.length,
      completed: 0,
      failed: 0,
      createdAt: new Date().toISOString(),
      filename: request.file.originalname,
    });
    await redis.set(csvKey, request.file.buffer);
    await redis.sadd(`statement:keys:${batchId}`, metadataKey, csvKey);
    await redis.zadd("statement:batches", Date.now(), batchId);
    await queue.addBulk(rows.map(row => ({
      name: "render-statement",
      data: { batchId, ...row },
      opts: { jobId: `${batchId}-${row.index}`, attempts: 3, removeOnComplete: 500, removeOnFail: 500 },
    })));
    await pruneBatches();
    return response.status(202).json({ batchId, total: rows.length });
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") return response.status(413).json({ error: "Keep the CSV under 256 KB." });
    return next(error);
  }
});

app.get("/api/batches/:batchId", async (request, response) => {
  const metadata = await redis.hgetall(`statement:batch:${request.params.batchId}`);
  if (!metadata.id) return response.status(404).json({ error: "That batch is no longer available." });
  const items = [];
  for (let index = 0; index < Number(metadata.total); index += 1) {
    const value = await redis.get(`statement:item:${metadata.id}:${index}`);
    if (value) items.push(JSON.parse(value));
  }
  response.json({ ...metadata, total: Number(metadata.total), completed: Number(metadata.completed), failed: Number(metadata.failed), items });
});

app.get("/batches/:batchId/statements/:index.pdf", async (request, response) => {
  const key = `statement:pdf:${request.params.batchId}:${request.params.index}`;
  const pdf = await redis.getBuffer(key);
  if (!pdf) return response.status(404).send("That statement is not ready.");
  const item = JSON.parse(await redis.get(`statement:item:${request.params.batchId}:${request.params.index}`));
  response.type("application/pdf").attachment(`${item.customer.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-statement.pdf`).send(pdf);
});

app.get("/batches/:batchId/all.zip", async (request, response) => {
  const metadata = await redis.hgetall(`statement:batch:${request.params.batchId}`);
  if (!metadata.id || Number(metadata.completed) !== Number(metadata.total)) return response.status(409).send("The batch is not complete yet.");
  response.attachment(`statements-${metadata.id.slice(0, 8)}.zip`);
  const archive = new ZipArchive({ zlib: { level: 6 } });
  archive.on("error", error => response.destroy(error));
  archive.pipe(response);
  for (let index = 0; index < Number(metadata.total); index += 1) {
    const [pdf, itemText] = await Promise.all([
      redis.getBuffer(`statement:pdf:${metadata.id}:${index}`),
      redis.get(`statement:item:${metadata.id}:${index}`),
    ]);
    const item = JSON.parse(itemText);
    archive.append(pdf, { name: `${String(index + 1).padStart(3, "0")}-${item.customer.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf` });
  }
  await archive.finalize();
});

app.get("/", (_request, response) => response.sendFile("index.html", { root: __dirname }));
app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(400).json({ error: error.message || "The batch could not be created." });
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, "0.0.0.0", () => console.log(`Statement desk ready on port ${port}`));
process.on("SIGTERM", () => server.close(async () => { await queue.close(); await redis.quit(); process.exit(0); }));

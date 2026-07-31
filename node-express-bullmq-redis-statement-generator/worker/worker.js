const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const PDFDocument = require("pdfkit");

const redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

async function markBatchOnce(batchId, markerKey, field) {
  return redis.eval(`
    if redis.call("SETNX", KEYS[1], "1") == 1 then
      redis.call("HINCRBY", KEYS[2], ARGV[1], 1)
      return 1
    end
    return 0
  `, 2, markerKey, `statement:batch:${batchId}`, field);
}

function renderStatement(data) {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: "LETTER", margins: { top: 56, left: 56, right: 56, bottom: 56 } });
    const chunks = [];
    document.on("data", chunk => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
    document.fillColor("#31594d").fontSize(12).text("NORTHLINE BILLING", { characterSpacing: 1.5 });
    document.moveDown(2).fillColor("#222722").font("Helvetica-Bold").fontSize(28).text("Monthly statement");
    document.moveDown(0.4).font("Helvetica").fontSize(11).fillColor("#6a6a63").text(data.period);
    document.moveDown(2).strokeColor("#d6d0c5").moveTo(56, document.y).lineTo(556, document.y).stroke();
    document.moveDown(2).fillColor("#222722").fontSize(10).text("PREPARED FOR");
    document.moveDown(0.5).font("Helvetica-Bold").fontSize(18).text(data.customer);
    document.font("Helvetica").fontSize(11).fillColor("#6a6a63").text(data.email);
    document.moveDown(3).fillColor("#222722").fontSize(10).text("BALANCE DUE");
    document.moveDown(0.5).font("Helvetica-Bold").fontSize(34).text(`$${(data.balanceCents / 100).toFixed(2)}`);
    document.moveDown(2).font("Helvetica").fontSize(11).fillColor("#55584f").text("Thank you for your business. Please include your statement number with payment.");
    document.moveDown(5).fontSize(9).fillColor("#8a887f").text(`Statement ${data.batchId.slice(0, 8).toUpperCase()}-${String(data.index + 1).padStart(3, "0")}`);
    document.end();
  });
}

const worker = new Worker("statements", async job => {
  const pdf = await renderStatement(job.data);
  const pdfKey = `statement:pdf:${job.data.batchId}:${job.data.index}`;
  const itemKey = `statement:item:${job.data.batchId}:${job.data.index}`;
  const doneKey = `statement:done:${job.data.batchId}:${job.data.index}`;
  await redis.set(pdfKey, pdf);
  await redis.set(itemKey, JSON.stringify({ index: job.data.index, customer: job.data.customer, email: job.data.email, bytes: pdf.length }));
  await redis.sadd(`statement:keys:${job.data.batchId}`, pdfKey, itemKey, doneKey);
  await markBatchOnce(job.data.batchId, doneKey, "completed");
  console.log(JSON.stringify({ event: "statement.ready", batch: job.data.batchId, index: job.data.index, customer: job.data.customer, bytes: pdf.length }));
  return { bytes: pdf.length };
}, { connection: redis, concurrency: 2, lockDuration: 15000 });

worker.on("failed", async (job, error) => {
  if (job && job.attemptsMade >= job.opts.attempts) {
    const failedKey = `statement:failed:${job.data.batchId}:${job.data.index}`;
    await redis.sadd(`statement:keys:${job.data.batchId}`, failedKey);
    await markBatchOnce(job.data.batchId, failedKey, "failed");
  }
  console.error(`Statement job ${job?.id || "unknown"} failed. ${error.message}`);
});
worker.on("ready", () => console.log("Statement worker ready for BullMQ jobs"));
worker.on("error", error => console.error(`Statement worker connection error. ${error.message}`));

async function stop(signal) {
  console.log(`Received ${signal}. Returning active jobs to BullMQ.`);
  await worker.close();
  await redis.quit();
  process.exit(0);
}
process.on("SIGTERM", () => void stop("SIGTERM"));
process.on("SIGINT", () => void stop("SIGINT"));

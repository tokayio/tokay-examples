import { createHmac, timingSafeEqual } from "node:crypto";
import express, { Request } from "express";

const app = express();
app.use(express.raw({ type: "*/*", limit: "1mb" }));

function sameHex(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

function signatureIsValid(request: Request, body: Buffer, secret: string) {
  const generic = request.get("x-webhook-signature");
  if (generic) {
    const supplied = generic.replace(/^sha256=/, "");
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    return sameHex(supplied, expected);
  }

  const stripe = request.get("stripe-signature");
  if (stripe) {
    const fields = stripe.split(",").map(part => part.split("=", 2));
    const timestamp = fields.find(([key]) => key === "t")?.[1];
    const signatures = fields.filter(([key]) => key === "v1").map(([, value]) => value);
    if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
    const expected = createHmac("sha256", secret).update(`${timestamp}.`).update(body).digest("hex");
    return signatures.some(value => sameHex(value, expected));
  }

  return false;
}

function readJson(body: Buffer) {
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    return null;
  }
}

function tagPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return "unstructured";
  const record = payload as Record<string, unknown>;
  if (typeof record.email === "string" && typeof record.message === "string") return "form lead";
  if (record.type === "order.created" || record.event === "order.created") return "new order";
  return "general";
}

function receive(request: Request, response: express.Response) {
  const body = Buffer.isBuffer(request.body) ? request.body : Buffer.from("");
  const secret = process.env.WEBHOOK_SECRET?.trim() || "";
  if (secret && !signatureIsValid(request, body, secret)) {
    console.log(JSON.stringify({ event: "webhook.rejected", hook: request.params.name || "test", reason: "bad signature" }));
    return response.status(401).json({ ok: false, error: "A valid webhook signature is required." });
  }

  const payload = readJson(body);
  const hook = request.params.name || "test";
  const tag = tagPayload(payload);
  const summary = {
    event: "webhook.received",
    hook,
    tag,
    providerEvent: payload?.type || payload?.event || null,
    bytes: body.length,
  };
  console.log(JSON.stringify(summary));
  return response.status(200).json({ ok: true, hook, tag, receivedAt: new Date().toISOString() });
}

app.post("/", receive);
app.post("/hooks/:name", receive);
app.get("/health", (_request, response) => response.json({ ok: true }));

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`Webhook handler ready on port ${port}`));

CREATE TABLE "events" (
  "id" uuid PRIMARY KEY,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "venue" text NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "price_cents" integer NOT NULL CHECK ("price_cents" >= 0),
  "capacity" integer NOT NULL CHECK ("capacity" > 0)
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY,
  "event_id" uuid NOT NULL REFERENCES "events" ("id"),
  "quantity" integer NOT NULL CHECK ("quantity" BETWEEN 1 AND 6),
  "amount_cents" integer NOT NULL CHECK ("amount_cents" >= 0),
  "status" text NOT NULL CHECK ("status" IN ('pending', 'paid')),
  "checkout_provider" text NOT NULL CHECK ("checkout_provider" IN ('simulated', 'stripe')),
  "stripe_session_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "orders_stripe_session_id_unique" ON "orders" ("stripe_session_id") WHERE "stripe_session_id" IS NOT NULL;

CREATE TABLE "tickets" (
  "id" uuid PRIMARY KEY,
  "order_id" uuid NOT NULL UNIQUE REFERENCES "orders" ("id"),
  "code" text NOT NULL UNIQUE,
  "issued_at" timestamptz NOT NULL DEFAULT now()
);

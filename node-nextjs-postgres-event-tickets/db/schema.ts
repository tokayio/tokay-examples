import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  venue: text("venue").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  priceCents: integer("price_cents").notNull(),
  capacity: integer("capacity").notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  quantity: integer("quantity").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull(),
  checkoutProvider: text("checkout_provider").notNull(),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey(),
  orderId: uuid("order_id").notNull().unique().references(() => orders.id),
  code: text("code").notNull().unique(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

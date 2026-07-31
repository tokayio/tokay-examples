import { Pool } from "pg";

declare global {
  var ticketPool: Pool | undefined;
}

export const pool = global.ticketPool || new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") global.ticketPool = pool;

import "dotenv/config"
import { defineConfig } from "prisma/config"

// Client generation reads this config but never connects to the database.
// Tokay supplies the real URL for rehearsal, migration, and runtime work.
const databaseUrl = process.env.DATABASE_URL || "postgresql://build:build@127.0.0.1:5432/build"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
})

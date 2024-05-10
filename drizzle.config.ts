import { defineConfig } from "drizzle-kit";

import { env } from "~/env.js";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migration/",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["nomad_competition_*"],
  verbose: true,
  strict: true,
});

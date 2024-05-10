import postgres from "postgres";
import { competitorsToCubeTypes } from "./schema";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

dotenv.config();

async function main() {
  const connection = postgres(process.env.DATABASE_URL || "", { max: 1 });

  const db = drizzle(connection, {
    schema,
  });

  const competitors = await db.query.competitors.findMany();

  await db
    .insert(competitorsToCubeTypes)
    .values(
      competitors.map((competitor) => ({
        competitorId: competitor.id,
        cubeTypeId: 6,
      })),
    )
    .onConflictDoNothing();

  process.exit(0);
}

main();

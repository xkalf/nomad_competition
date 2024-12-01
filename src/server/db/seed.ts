import postgres from 'postgres'
import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { and, eq, exists } from 'drizzle-orm'

dotenv.config()

async function main() {
  const connection = postgres(process.env.DATABASE_URL || '', { max: 1 })

  const db = drizzle(connection, {
    schema,
  })

  await db.delete(schema.invoices).where(
    exists(
      db
        .select({
          id: schema.competitors.id,
        })
        .from(schema.competitors)
        .where(
          and(
            eq(schema.competitors.competitionId, 5),
            eq(schema.invoices.competitorId, schema.competitors.id),
          ),
        ),
    ),
  )
  await db.delete(schema.competitorsToCubeTypes).where(
    exists(
      db
        .select({
          id: schema.competitors.id,
        })
        .from(schema.competitors)
        .where(
          and(
            eq(schema.competitors.competitionId, 5),
            eq(
              schema.competitorsToCubeTypes.competitorId,
              schema.competitors.id,
            ),
          ),
        ),
    ),
  )
  await db
    .delete(schema.competitors)
    .where(eq(schema.competitors.competitionId, 5))

  process.exit(0)
}

main()

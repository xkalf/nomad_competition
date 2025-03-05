import { PostgresJsQueryResultHKT, drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { ExtractTablesWithRelations } from 'drizzle-orm'
import { PgTransaction } from 'drizzle-orm/pg-core'
import { env } from '~/env.js'
import * as schema from './schema'

export const db = drizzle(postgres(env.DATABASE_URL, { prepare: false }), {
  schema,
  casing: 'snake_case',
})

export type DB = typeof db
type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>
export type DBType = DB | Transaction

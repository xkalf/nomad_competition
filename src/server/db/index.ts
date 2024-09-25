import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '~/env.js'
import * as schema from './schema'
import { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core'

export const db = drizzle(postgres(env.DATABASE_URL), { schema })

type DB = typeof db
type Transaction = PgTransaction<PgQueryResultHKT, typeof schema>
export type DBType = DB | Transaction

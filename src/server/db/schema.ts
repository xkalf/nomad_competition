import { relations } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  pgTableCreator,
  primaryKey,
  real,
  serial,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { InvoiceCheckResponse } from 'mn-payment'
import { type AdapterAccount } from 'next-auth/adapters'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `nomad_competition_${name}`)

export const resultType = pgEnum('result_type', ['ao5', 'ao3'])
export type ResultType = (typeof resultType.enumValues)[number]

export const users = createTable('user', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  firstname: varchar('firstname', { length: 255 }).notNull(),
  lastname: varchar('lastname', { length: 255 }).notNull(),
  wcaId: varchar('wca_id', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: integer('phone').notNull(),
  birthDate: date('birth_date').notNull(),
  emailVerified: timestamp('emailVerified', {
    mode: 'date',
  }),
  image: varchar('image', { length: 255 }),
  isAdmin: boolean('is_admin').notNull().default(false),
  password: varchar('password', { length: 255 }).notNull(),
  isMale: boolean('is_male').notNull().default(true),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  competitors: many(competitors),
  rankSingle: many(rankSingle),
  rankAverage: many(rankAverage),
}))

export const accounts = createTable(
  'account',
  {
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 255 })
      .$type<AdapterAccount['type']>()
      .notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    index('account_userId_idx').on(account.userId),
  ],
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = createTable(
  'session',
  {
    sessionToken: varchar('sessionToken', { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (session) => [index('session_userId_idx').on(session.userId)],
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokens = createTable(
  'verificationToken',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

export const cubeTypes = createTable('cube_types', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  image: varchar('image'),
  order: real('order').notNull().default(1),
  type: resultType('type').notNull().default('ao5'),
  scrambleMapper: varchar('scramble_mapper'),
})

export const cubeTypesRelations = relations(cubeTypes, ({ many }) => ({
  competitorsToCubeTypes: many(competitorsToCubeTypes),
  competitionsToCubeTypes: many(competitionsToCubeType),
  fees: many(fees),
}))

export const competitions = createTable('competitions', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  address: varchar('address').notNull(),
  addressLink: varchar('address_link'),
  maxCompetitors: integer('max_competitors').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  registerStartDate: timestamp('register_start_date'),
  registerEndDate: timestamp('register_end_date'),
  contact: text('contact'),
  registrationRequirments: text('registration_requirments'),
  baseFee: numeric('base_fee').notNull().default('0'),
  guestFee: numeric('guest_fee').notNull().default('0'),
  freeGuests: integer('free_guests').notNull().default(0),
  slug: varchar('slug').unique().notNull(),
  image: varchar('image'),
})

export const competitionsRelations = relations(competitions, ({ many }) => ({
  competitors: many(competitors),
  competitionsToCubeTypes: many(competitionsToCubeType),
  schedules: many(schedules),
  ageGroups: many(ageGroups),
  fees: many(fees),
}))

export const competitionsToCubeType = createTable(
  'competitions_to_cube_type',
  {
    cubeTypeId: integer('cube_type_id')
      .notNull()
      .references(() => cubeTypes.id),
    competitionId: integer('competition_id')
      .notNull()
      .references(() => competitions.id),
  },
  (t) => [
    primaryKey({
      columns: [t.competitionId, t.cubeTypeId],
    }),
  ],
)

export const competitionsToCubeTypeRelations = relations(
  competitionsToCubeType,
  ({ one }) => ({
    cubeType: one(cubeTypes, {
      fields: [competitionsToCubeType.cubeTypeId],
      references: [cubeTypes.id],
    }),
    competition: one(competitions, {
      fields: [competitionsToCubeType.competitionId],
      references: [competitions.id],
    }),
  }),
)

export const competitorsStatusEnum = pgEnum('competitor_status', [
  'Created',
  'Verified',
  'Cancelled',
])

export const competitors = createTable(
  'competitors',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id),
    competitionId: integer('competition_id')
      .notNull()
      .references(() => competitions.id),
    guestCount: integer('guest_count').notNull().default(0),
    description: varchar('description'),
    requestedAt: timestamp('requested_at').notNull().defaultNow(),
    verifiedAt: timestamp('verified_at'),
    status: competitorsStatusEnum('status').notNull().default('Created'),
    schoolId: integer().references(() => schools.id),
    provinceId: uuid().references(() => provinces.id),
    districtId: uuid().references(() => districts.id),
    verifiedId: integer('verified_id'),
    ageGroupId: integer().references(() => ageGroups.id),
  },
  (t) => [unique().on(t.competitionId, t.userId)],
)

export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  user: one(users, {
    fields: [competitors.userId],
    references: [users.id],
  }),
  competition: one(competitions, {
    fields: [competitors.competitionId],
    references: [competitions.id],
  }),
  competitorsToCubeTypes: many(competitorsToCubeTypes),
  invoices: many(invoices),
  school: one(schools, {
    fields: [competitors.schoolId],
    references: [schools.id],
  }),
}))

export const competitorCubeTypeStatus = pgEnum('competitor_cube_type_status', [
  'Created',
  'Paid',
  'Cancelled',
])

export const competitorsToCubeTypes = createTable(
  'competitors_to_cube_types',
  {
    competitorId: integer('competitor_id')
      .notNull()
      .references(() => competitors.id),
    cubeTypeId: integer('cube_type_id')
      .notNull()
      .references(() => cubeTypes.id),
    status: competitorCubeTypeStatus('status').notNull().default('Created'),
  },
  (t) => [
    primaryKey({
      columns: [t.competitorId, t.cubeTypeId],
    }),
  ],
)

export const competitorsToCubeTypesRelations = relations(
  competitorsToCubeTypes,
  ({ one }) => ({
    competitor: one(competitors, {
      fields: [competitorsToCubeTypes.competitorId],
      references: [competitors.id],
    }),
    cubeType: one(cubeTypes, {
      fields: [competitorsToCubeTypes.cubeTypeId],
      references: [cubeTypes.id],
    }),
  }),
)

export const schedules = createTable('schedules', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  date: date('date').notNull(),
  cutOff: varchar('cut_off'),
  timeLimit: varchar('time_limit'),
  competitorLimit: integer('competitor_limit'),
  competitionId: integer('competition_id')
    .references(() => competitions.id)
    .notNull(),
  roundId: integer('round_id').references(() => rounds.id),
})

export const schedulesRelations = relations(schedules, ({ one }) => ({
  competition: one(competitions, {
    fields: [schedules.competitionId],
    references: [competitions.id],
  }),
  round: one(rounds, {
    fields: [schedules.roundId],
    references: [rounds.id],
  }),
}))

export const ageGroups = createTable(
  'age_groups',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    start: integer('start').notNull(),
    end: integer('end'),
    order: real('order').notNull().default(1),
    competitionId: integer('competition_id')
      .notNull()
      .references(() => competitions.id),
    cubeTypeId: integer('cube_type_id')
      .references(() => cubeTypes.id)
      .notNull(),
  },
  (t) => [unique().on(t.competitionId, t.cubeTypeId, t.start)],
)

export const ageGroupsRelations = relations(ageGroups, ({ one }) => ({
  competition: one(competitions, {
    fields: [ageGroups.competitionId],
    references: [competitions.id],
  }),
  cubeType: one(cubeTypes, {
    fields: [ageGroups.cubeTypeId],
    references: [cubeTypes.id],
  }),
}))

export const paymentsTypeEnum = pgEnum('payment_type', ['qpay'])

export const payments = createTable('qpay', {
  type: paymentsTypeEnum('type').notNull().primaryKey().unique(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  accessExpiresAt: timestamp('access_expires_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  refreshExpiresAt: timestamp('refresh_expires_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
})

export const invoices = createTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceCode: varchar('invoice_code'),
  amount: numeric('amount').notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  competitorId: integer('competitor_id')
    .references(() => competitors.id)
    .notNull(),
  userId: varchar('user_id')
    .notNull()
    .references(() => users.id),
  cubeTypeIds: integer('cube_type_ids').array(),
  guestCount: integer('guest_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  hasCompetitionFee: boolean('has_competition_fee').notNull().default(false),
  paymentResult: json('payment_result')
    .$type<InvoiceCheckResponse | null>()
    .default(null),
})

export const invoicesRelations = relations(invoices, ({ one }) => ({
  competitor: one(competitors, {
    fields: [invoices.competitorId],
    references: [competitors.id],
  }),
}))

export const fees = createTable('fees', {
  id: serial('id').primaryKey(),
  cubeTypeId: integer('cube_type_id')
    .notNull()
    .references(() => cubeTypes.id),
  amount: numeric('amount').default('0').notNull(),
  competitionId: integer('competition_id').references(() => competitions.id),
})

export const feesRelation = relations(fees, ({ one }) => ({
  cubeType: one(cubeTypes, {
    fields: [fees.cubeTypeId],
    references: [cubeTypes.id],
  }),
  competition: one(competitions, {
    fields: [fees.competitionId],
    references: [competitions.id],
  }),
}))

export const rounds = createTable('rounds', {
  id: serial('id').primaryKey(),
  competitionId: integer('competition_id')
    .notNull()
    .references(() => competitions.id),
  cubeTypeId: integer('cube_type_id')
    .notNull()
    .references(() => cubeTypes.id),
  isDuel: boolean('is_duel').default(false),
  name: varchar('name').notNull(),
  nextCompetitor: integer('next_competitor').notNull(),
  perGroupCount: integer('per_group_count').notNull(),
  isActive: boolean().default(false),
})

export const roundsRelation = relations(rounds, ({ one }) => ({
  cubeType: one(cubeTypes, {
    fields: [rounds.cubeTypeId],
    references: [cubeTypes.id],
  }),
}))

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  roundId: integer('round_id').references(() => rounds.id, {
    onDelete: 'cascade',
  }),
  scramble: varchar('scramble').notNull(),
  cubeTypeId: integer('cube_type_id').references(() => cubeTypes.id),
  competitionId: integer('competition_id').references(() => competitions.id),
})

export const groupsRelations = relations(groups, ({ one }) => ({
  round: one(rounds, {
    fields: [groups.roundId],
    references: [rounds.id],
  }),
  cubeType: one(cubeTypes, {
    fields: [groups.cubeTypeId],
    references: [cubeTypes.id],
  }),
  competition: one(competitions, {
    fields: [groups.competitionId],
    references: [competitions.id],
  }),
}))

export const results = createTable(
  'results',
  {
    id: serial('id').primaryKey(),
    solve1: integer('solve1'),
    solve2: integer('solve2'),
    solve3: integer('solve3'),
    solve4: integer('solve4'),
    solve5: integer('solve5'),
    best: integer('best'),
    average: integer('average'),
    type: resultType('type').notNull(),
    group: varchar('group').notNull(),
    roundId: integer('round_id')
      .notNull()
      .references(() => rounds.id),
    cubeTypeId: integer('cube_type_id')
      .notNull()
      .references(() => cubeTypes.id),
    competitionId: integer('competition_id')
      .notNull()
      .references(() => competitions.id),
    competitorId: integer('competitor_id')
      .notNull()
      .references(() => competitors.id),
    createdUserId: varchar('created_user_id')
      .notNull()
      .references(() => users.id),
    updatedUserId: varchar('updated_user_id')
      .notNull()
      .references(() => users.id),
  },
  (t) => [unique().on(t.competitorId, t.roundId)],
)

export const resultsRelation = relations(results, ({ one }) => ({
  round: one(rounds, {
    fields: [results.roundId],
    references: [rounds.id],
  }),
  cubeType: one(cubeTypes, {
    fields: [results.cubeTypeId],
    references: [cubeTypes.id],
  }),
  competition: one(competitions, {
    fields: [results.competitionId],
    references: [competitions.id],
  }),
  competitor: one(competitors, {
    fields: [results.competitorId],
    references: [competitors.id],
  }),
}))

export const provinces = pgTable('provinces', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.varchar().notNull(),
}))

export const districts = pgTable('districts', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.varchar().notNull(),
  provinceId: t
    .uuid()
    .references(() => provinces.id)
    .notNull(),
}))

export const schools = pgTable('schools', (t) => ({
  id: t.serial().primaryKey(),
  school: t.varchar().notNull(),
  provinceId: t
    .uuid()
    .references(() => provinces.id)
    .notNull(),
  districtId: t
    .uuid()
    .references(() => districts.id)
    .notNull(),
}))

export const medals = pgTable('medals', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .varchar()
    .notNull()
    .references(() => users.id),
  competitionId: t
    .integer()
    .notNull()
    .references(() => competitions.id),
  cubeTypeId: t
    .integer()
    .notNull()
    .references(() => cubeTypes.id),
  roundId: t
    .integer()
    .notNull()
    .references(() => rounds.id),
  group: t.varchar().notNull(),
  resultId: t.integer().references(() => results.id),
  medal: t.integer().notNull(),
}))

export const ageGroupMedals = pgTable('age_group_medals', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .varchar()
    .notNull()
    .references(() => users.id),
  competitionId: t
    .integer()
    .notNull()
    .references(() => competitions.id),
  cubeTypeId: t
    .integer()
    .notNull()
    .references(() => cubeTypes.id),
  roundId: t
    .integer()
    .notNull()
    .references(() => rounds.id),
  group: t.varchar().notNull(),
  ageGroupId: t
    .integer()
    .notNull()
    .references(() => ageGroups.id),
  medal: t.integer().notNull(),
}))

export const rankAverage = pgTable(
  'rank_average',
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    value: t.integer().notNull(),
    userId: t
      .varchar()
      .notNull()
      .references(() => users.id),
    cubeTypeId: t
      .integer()
      .notNull()
      .references(() => cubeTypes.id),
    roundId: t
      .integer()
      .notNull()
      .references(() => rounds.id),
    resultId: t.integer().references(() => results.id),
    allRank: t.integer().notNull(),
    provinceRank: t.integer().notNull(),
    provinceId: t
      .uuid()
      .notNull()
      .references(() => provinces.id),
    districtId: t
      .uuid()
      .notNull()
      .references(() => districts.id),
    districtRank: t.integer().notNull(),
  }),
  (t) => [unique().on(t.userId, t.cubeTypeId)],
)

export const rankAverageRelation = relations(rankAverage, ({ one }) => ({
  user: one(users, {
    fields: [rankAverage.userId],
    references: [users.id],
  }),
}))

export const rankSingle = pgTable(
  'rank_single',
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    value: t.integer().notNull(),
    userId: t
      .varchar()
      .notNull()
      .references(() => users.id),
    cubeTypeId: t
      .integer()
      .notNull()
      .references(() => cubeTypes.id),
    roundId: t
      .integer()
      .notNull()
      .references(() => rounds.id),
    resultId: t.integer().references(() => results.id),
    allRank: t.integer().notNull(),
    provinceRank: t.integer().notNull(),
    districtRank: t.integer().notNull(),
    provinceId: t
      .uuid()
      .notNull()
      .references(() => provinces.id),
    districtId: t
      .uuid()
      .notNull()
      .references(() => districts.id),
  }),
  (t) => [unique().on(t.cubeTypeId, t.userId)],
)

export const rankSingleRelations = relations(rankSingle, ({ one }) => ({
  user: one(users, {
    fields: [rankSingle.userId],
    references: [users.id],
  }),
}))

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTableCreator,
  primaryKey,
  real,
  serial,
  text,
  time,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `nomad_competition_${name}`,
);

export const resultType = pgEnum("result_type", ["ao5", "ao3"]);
export type ResultType = (typeof resultType.enumValues)[number];

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  wcaId: varchar("wca_id", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: integer("phone").notNull(),
  birthDate: date("birth_date").notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  isAdmin: boolean("is_admin").notNull().default(false),
  password: varchar("password", { length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  competitors: many(competitors),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const cubeTypes = createTable("cube_types", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  image: varchar("image"),
  order: real("order").notNull().default(1),
  type: resultType("type").notNull().default("ao5"),
});

export const cubeTypesRelations = relations(cubeTypes, ({ many }) => ({
  competitorsToCubeTypes: many(competitorsToCubeTypes),
  competitionsToCubeTypes: many(competitionsToCubeType),
}));

export const competitions = createTable("competitions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  addressLink: varchar("address_link"),
  maxCompetitors: integer("max_competitors").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  registerStartDate: timestamp("register_start_date", {
    withTimezone: true,
  }),
  registerEndDate: timestamp("register_end_date", {
    withTimezone: true,
  }),
  contact: text("contact"),
  registrationRequirments: text("registration_requirments"),
  baseFee: numeric("base_fee").notNull().default("0"),
  guestFee: numeric("guest_fee").notNull().default("0"),
  freeGuests: integer("free_guests").notNull().default(0),
});

export const competitionsRelations = relations(competitions, ({ many }) => ({
  competitors: many(competitors),
  competitionsToCubeTypes: many(competitionsToCubeType),
  schedules: many(schedules),
  ageGroups: many(ageGroups),
  fees: many(fees),
}));

export const competitionsToCubeType = createTable(
  "competitions_to_cube_type",
  {
    cubeTypeId: integer("cube_type_id")
      .notNull()
      .references(() => cubeTypes.id),
    competitionId: integer("competition_id")
      .notNull()
      .references(() => competitions.id),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.competitionId, t.cubeTypeId],
    }),
  }),
);

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
);

export const competitors = createTable(
  "competitors",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    competitionId: integer("competition_id")
      .notNull()
      .references(() => competitions.id),
    guestCount: integer("guest_count").notNull().default(0),
    description: varchar("description"),
    requestedAt: timestamp("requested_at").notNull().defaultNow(),
    verifiedAt: timestamp("verified_at"),
  },
  (t) => ({
    competitionIdUserIdUniq: unique().on(t.competitionId, t.userId),
  }),
);

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
}));

export const competitorsToCubeTypes = createTable(
  "competitors_to_cube_types",
  {
    competitorId: integer("competitor_id")
      .notNull()
      .references(() => competitors.id),
    cubeTypeId: integer("cube_type_id")
      .notNull()
      .references(() => cubeTypes.id),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.competitorId, t.cubeTypeId],
    }),
  }),
);

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
);

export const schedules = createTable("schedules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  date: date("date").notNull(),
  cutOff: varchar("cut_off"),
  timeLimit: varchar("time_limit"),
  competitorLimit: integer("competitor_limit"),
  competitionId: integer("competition_id")
    .references(() => competitions.id)
    .notNull(),
});

export const schedulesRelations = relations(schedules, ({ one }) => ({
  competition: one(competitions, {
    fields: [schedules.competitionId],
    references: [competitions.id],
  }),
}));

export const ageGroups = createTable("age_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  start: integer("start").notNull(),
  end: integer("end"),
  order: real("order").notNull().default(1),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),
  cubeTypeId: integer("cube_type_id")
    .references(() => cubeTypes.id)
    .notNull(),
});

export const ageGroupsRelations = relations(ageGroups, ({ one }) => ({
  competition: one(competitions, {
    fields: [ageGroups.competitionId],
    references: [competitions.id],
  }),
  cubeType: one(cubeTypes, {
    fields: [ageGroups.cubeTypeId],
    references: [cubeTypes.id],
  }),
}));

export const paymentsTypeEnum = pgEnum("payment_type", ["qpay"]);

export const payments = createTable("qpay", {
  type: paymentsTypeEnum("type").notNull().primaryKey().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  accessExpiresAt: timestamp("access_expires_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  refreshExpiresAt: timestamp("refresh_expires_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const invoices = createTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceCode: varchar("invoice_code"),
  amount: numeric("amount").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  competitorId: integer("competitor_id")
    .references(() => competitors.id)
    .notNull(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  competitor: one(competitors, {
    fields: [invoices.competitorId],
    references: [competitors.id],
  }),
}));

export const fees = createTable("fees", {
  id: serial("id").primaryKey(),
  cubeTypeId: integer("cube_type_id")
    .notNull()
    .references(() => cubeTypes.id),
  amount: numeric("amount").default("0").notNull(),
  competitionId: integer("competition_id").references(() => competitions.id),
});

export const feesRelation = relations(fees, ({ one }) => ({
  cubeType: one(cubeTypes, {
    fields: [fees.cubeTypeId],
    references: [cubeTypes.id],
  }),
  competition: one(competitions, {
    fields: [fees.competitionId],
    references: [competitions.id],
  }),
}));

export const rounds = createTable("rounds", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),
  cubeTypeId: integer("cube_type_id")
    .notNull()
    .references(() => cubeTypes.id),
  isDuel: boolean("is_duel").default(false),
  name: varchar("name").notNull(),
  nextCompetitor: integer("next_competitor").notNull(),
});

export const roundsRelation = relations(rounds, ({ one }) => ({
  cubeType: one(cubeTypes, {
    fields: [rounds.cubeTypeId],
    references: [cubeTypes.id],
  }),
}));

export const results = createTable("results", {
  id: serial("id").primaryKey(),
  solve1: integer("solve1").notNull(),
  solve2: integer("solve2").notNull(),
  solve3: integer("solve3").notNull(),
  solve4: integer("solve4"),
  solve5: integer("solve5"),
  best: integer("best").notNull(),
  average: integer("average").notNull(),
  type: resultType("type").notNull(),
  roundId: integer("round_id")
    .notNull()
    .references(() => rounds.id),
  cubeTypeId: integer("cube_type_id")
    .notNull()
    .references(() => cubeTypes.id),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),
  competitorId: integer("competitor_id")
    .notNull()
    .references(() => competitors.id),
  createdUserId: varchar("created_user_id")
    .notNull()
    .references(() => users.id),
  updatedUserId: varchar("updated_user_id")
    .notNull()
    .references(() => users.id),
});

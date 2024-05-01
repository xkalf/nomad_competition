DO $$ BEGIN
 CREATE TYPE "payment_type" AS ENUM('qpay');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "nomad_competition_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_age_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"start" integer NOT NULL,
	"end" integer,
	"competition_id" integer NOT NULL,
	"cube_type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"address" varchar NOT NULL,
	"address_link" varchar,
	"max_competitors" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"register_start_date" timestamp with time zone,
	"register_end_date" timestamp with time zone,
	"contact" text,
	"registration_requirments" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_competitions_to_cube_type" (
	"cube_type_id" integer NOT NULL,
	"competition_id" integer NOT NULL,
	CONSTRAINT "nomad_competition_competitions_to_cube_type_competition_id_cube_type_id_pk" PRIMARY KEY("competition_id","cube_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_competitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"competition_id" integer NOT NULL,
	"guest_count" integer DEFAULT 0 NOT NULL,
	"description" varchar,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_competitors_to_cube_types" (
	"competitor_id" integer NOT NULL,
	"cube_type_id" integer NOT NULL,
	CONSTRAINT "nomad_competition_competitors_to_cube_types_competitor_id_cube_type_id_pk" PRIMARY KEY("competitor_id","cube_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_cube_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"image" varchar,
	"order" real DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_invoices" (
	"id" varchar PRIMARY KEY NOT NULL,
	"amount" numeric NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"competitor_id" integer NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_qpay" (
	"type" "payment_type" PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"access_expires_at" timestamp with time zone NOT NULL,
	"refresh_expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "nomad_competition_qpay_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"date" date NOT NULL,
	"cut_off" varchar,
	"time_limit" varchar,
	"competitor_limit" integer,
	"competition_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"wca_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone" integer NOT NULL,
	"birth_date" date NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"is_admin" boolean DEFAULT false NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "nomad_competition_user_wca_id_unique" UNIQUE("wca_id"),
	CONSTRAINT "nomad_competition_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nomad_competition_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "nomad_competition_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "nomad_competition_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "nomad_competition_session" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_account" ADD CONSTRAINT "nomad_competition_account_userId_nomad_competition_user_id_fk" FOREIGN KEY ("userId") REFERENCES "nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_age_groups" ADD CONSTRAINT "nomad_competition_age_groups_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_age_groups" ADD CONSTRAINT "nomad_competition_age_groups_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitions_to_cube_type" ADD CONSTRAINT "nomad_competition_competitions_to_cube_type_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitions_to_cube_type" ADD CONSTRAINT "nomad_competition_competitions_to_cube_type_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors_to_cube_types" ADD CONSTRAINT "nomad_competition_competitors_to_cube_types_competitor_id_nomad_competition_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "nomad_competition_competitors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors_to_cube_types" ADD CONSTRAINT "nomad_competition_competitors_to_cube_types_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_invoices" ADD CONSTRAINT "nomad_competition_invoices_competitor_id_nomad_competition_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "nomad_competition_competitors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_invoices" ADD CONSTRAINT "nomad_competition_invoices_user_id_nomad_competition_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_schedules" ADD CONSTRAINT "nomad_competition_schedules_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_session" ADD CONSTRAINT "nomad_competition_session_userId_nomad_competition_user_id_fk" FOREIGN KEY ("userId") REFERENCES "nomad_competition_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

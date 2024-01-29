CREATE TABLE IF NOT EXISTS "nomad_competition_competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"address" varchar NOT NULL,
	"max_competitors" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL
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
	"user_id" integer NOT NULL,
	"competition_id" integer NOT NULL,
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
	"name" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nomad_competition_user" RENAME COLUMN "name" TO "firstname";--> statement-breakpoint
ALTER TABLE "nomad_competition_user" ALTER COLUMN "firstname" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_user" ADD COLUMN "lastname" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_user" ADD COLUMN "wca_id" varchar(255);--> statement-breakpoint
ALTER TABLE "nomad_competition_user" ADD COLUMN "phone" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "nomad_competition_user" ADD COLUMN "birth_date" date NOT NULL;--> statement-breakpoint
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

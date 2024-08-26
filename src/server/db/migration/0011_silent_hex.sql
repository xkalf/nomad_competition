CREATE TABLE IF NOT EXISTS "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"round_id" integer,
	"scramble" varchar NOT NULL,
	"cube_type_id" integer,
	"competition_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "public"."nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

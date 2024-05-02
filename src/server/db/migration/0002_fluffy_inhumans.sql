CREATE TABLE IF NOT EXISTS "nomad_competition_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"cube_type" integer NOT NULL,
	"amount" numeric DEFAULT '0' NOT NULL,
	"competition_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_fees" ADD CONSTRAINT "nomad_competition_fees_cube_type_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type") REFERENCES "nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_fees" ADD CONSTRAINT "nomad_competition_fees_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

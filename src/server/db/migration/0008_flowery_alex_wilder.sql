CREATE TABLE IF NOT EXISTS "nomad_competition_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"start_time" time NOT NULL,
	"competition_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_schedules" ADD CONSTRAINT "nomad_competition_schedules_competition_id_nomad_competition_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "nomad_competition_competitions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "nomad_competition_schedules" ADD COLUMN "round_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_schedules" ADD CONSTRAINT "nomad_competition_schedules_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

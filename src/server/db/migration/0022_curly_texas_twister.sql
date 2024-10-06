ALTER TABLE "groups" DROP CONSTRAINT "groups_round_id_nomad_competition_rounds_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_round_id_nomad_competition_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."nomad_competition_rounds"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

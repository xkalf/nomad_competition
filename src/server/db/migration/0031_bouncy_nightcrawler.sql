ALTER TABLE "nomad_competition_competitors" ADD COLUMN "schoolId" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_schoolId_provinces_id_fk" FOREIGN KEY ("schoolId") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

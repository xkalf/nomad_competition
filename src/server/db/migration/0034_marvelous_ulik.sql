ALTER TABLE "provinces" RENAME TO "schools";--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors" DROP CONSTRAINT "nomad_competition_competitors_schoolId_provinces_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_schoolId_schools_id_fk" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

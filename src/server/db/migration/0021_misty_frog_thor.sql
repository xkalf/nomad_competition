ALTER TABLE "nomad_competition_age_groups" ADD COLUMN "cube_type_id" integer;--> statement-breakpoint
UPDATE "nomad_competition_age_groups" SET "cube_type_id" = (SELECT id FROM "cube_types" LIMIT 1);--> statement-breakpoint
ALTER TABLE "nomad_competition_age_groups" ALTER COLUMN "cube_type_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_age_groups" ADD CONSTRAINT "nomad_competition_age_groups_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

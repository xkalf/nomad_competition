ALTER TABLE "nomad_competition_fees" RENAME COLUMN "cube_type" TO "cube_type_id";--> statement-breakpoint
ALTER TABLE "nomad_competition_fees" DROP CONSTRAINT "nomad_competition_fees_cube_type_nomad_competition_cube_types_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_fees" ADD CONSTRAINT "nomad_competition_fees_cube_type_id_nomad_competition_cube_types_id_fk" FOREIGN KEY ("cube_type_id") REFERENCES "nomad_competition_cube_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

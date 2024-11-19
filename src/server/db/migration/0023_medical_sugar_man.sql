DO $$ BEGIN
 CREATE TYPE "public"."competitor_cube_type_status" AS ENUM('Created', 'Paid', 'Cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors_to_cube_types" ADD COLUMN "status" "competitor_cube_type_status" DEFAULT 'Created' NOT NULL;
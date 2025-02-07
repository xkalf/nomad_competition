CREATE TABLE IF NOT EXISTS "districts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar,
	"province_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "provinces" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar
);
--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors" RENAME COLUMN "schoolId" TO "school_id";--> statement-breakpoint
ALTER TABLE "nomad_competition_competitors" DROP CONSTRAINT "nomad_competition_competitors_schoolId_schools_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "districts" ADD CONSTRAINT "districts_province_id_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nomad_competition_competitors" ADD CONSTRAINT "nomad_competition_competitors_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

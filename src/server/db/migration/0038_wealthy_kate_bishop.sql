ALTER TABLE "schools" ALTER COLUMN "province_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" ALTER COLUMN "district_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schools" DROP COLUMN IF EXISTS "province";--> statement-breakpoint
ALTER TABLE "schools" DROP COLUMN IF EXISTS "district";
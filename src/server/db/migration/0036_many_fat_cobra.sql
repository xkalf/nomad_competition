ALTER TABLE "districts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "provinces" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
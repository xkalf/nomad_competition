ALTER TABLE "nomad_competition_user" ADD COLUMN "is_admin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "nomad_competition_user" ADD COLUMN "password" varchar(255) NOT NULL;

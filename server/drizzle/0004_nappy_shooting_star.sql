ALTER TABLE "message" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "updated_at" SET NOT NULL;
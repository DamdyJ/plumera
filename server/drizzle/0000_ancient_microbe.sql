CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"email_address" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);

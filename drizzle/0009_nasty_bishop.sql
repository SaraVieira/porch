CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'link' NOT NULL,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now()
);

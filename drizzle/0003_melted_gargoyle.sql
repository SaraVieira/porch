CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"dev" text,
	"genres" jsonb,
	"platforms" jsonb,
	"summary" text,
	"steam" integer,
	"score" integer,
	"release" text,
	"time" text,
	"notes" text,
	"date" text
);

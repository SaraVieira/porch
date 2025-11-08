CREATE TABLE "countries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region" text,
	"flag" text,
	"location" jsonb,
	"subregion" text,
	"currency" text
);

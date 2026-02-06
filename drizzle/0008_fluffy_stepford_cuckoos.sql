CREATE TABLE "habit_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"habit_id" integer NOT NULL,
	"date" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"emoji" text DEFAULT '',
	"color" text DEFAULT '#8b5cf6',
	"created_at" timestamp DEFAULT now()
);

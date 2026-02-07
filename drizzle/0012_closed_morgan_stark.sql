CREATE TABLE "rss_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"feed_id" integer NOT NULL,
	"guid" text NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"published_at" text,
	"author" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rss_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rss_feeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"site_url" text,
	"title" text NOT NULL,
	"favicon" text,
	"category_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

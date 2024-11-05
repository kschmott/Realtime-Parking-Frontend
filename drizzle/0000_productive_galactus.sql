CREATE TABLE IF NOT EXISTS "spots" (
	"id" integer PRIMARY KEY NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"status" text NOT NULL
);

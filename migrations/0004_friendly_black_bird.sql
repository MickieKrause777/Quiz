CREATE TYPE "public"."matchmaking_status" AS ENUM('waiting', 'matched', 'cancelled');--> statement-breakpoint
CREATE TABLE "matchmaking_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" varchar(255) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"status" "matchmaking_status" DEFAULT 'waiting' NOT NULL,
	CONSTRAINT "matchmaking_queue_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "matchmaking_queue" ADD CONSTRAINT "matchmaking_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
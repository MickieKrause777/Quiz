CREATE TYPE "public"."match_status" AS ENUM('waiting', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"player1_id" uuid NOT NULL,
	"player2_id" uuid NOT NULL,
	"player1_score" integer DEFAULT 0,
	"player2_score" integer DEFAULT 0,
	"current_turn_player" uuid NOT NULL,
	"round_number" integer DEFAULT 1,
	"status" "match_status" DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "matches_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "player_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"is_correct" boolean NOT NULL,
	"round_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "player_answers_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player1_id_users_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player2_id_users_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_current_turn_player_users_id_fk" FOREIGN KEY ("current_turn_player") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_answers" ADD CONSTRAINT "player_answers_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_answers" ADD CONSTRAINT "player_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_answers" ADD CONSTRAINT "player_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_answers" ADD CONSTRAINT "player_answers_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE no action ON UPDATE no action;
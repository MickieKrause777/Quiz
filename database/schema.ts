import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const matchmakingStatusEnum = pgEnum("matchmaking_status", [
  "waiting",
  "matched",
  "cancelled",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "waiting",
  "in_progress",
  "completed",
  "cancelled",
]);

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  fullName: varchar("name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  xp: integer("xp").default(0),
  lastActivityDate: timestamp("last_activity_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  views: integer("views").notNull().default(0),
  category: varchar("category", { length: 255 }).notNull(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  question: text("question").notNull(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id),
});

export const answers = pgTable("answers", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  text: varchar("text", { length: 255 }).notNull(),
  description: text("description").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id),
});

export const matchmakingQueue = pgTable("matchmaking_queue", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  category: varchar("category", { length: 255 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  status: matchmakingStatusEnum("status").notNull().default("waiting"),
});

export const matches = pgTable("matches", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id),
  player1Id: uuid("player1_id")
    .notNull()
    .references(() => users.id),
  player2Id: uuid("player2_id")
    .notNull()
    .references(() => users.id),
  player1Score: integer("player1_score").default(0),
  player2Score: integer("player2_score").default(0),
  currentTurnPlayer: uuid("current_turn_player")
    .notNull()
    .references(() => users.id),
  roundNumber: integer("round_number").default(1),
  status: matchStatusEnum("status").notNull().default("waiting"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const playerAnswers = pgTable("player_answers", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id),
  answerId: uuid("answer_id")
    .notNull()
    .references(() => answers.id),
  isCorrect: boolean("is_correct").notNull(),
  roundNumber: integer("round_number").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

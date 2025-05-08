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

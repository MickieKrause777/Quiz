import { relations } from "drizzle-orm";
import { quizzes, questions, answers, users, matchmakingQueue } from "./schema";

export const userRelations = relations(users, ({ many }) => ({
  quizzes: many(quizzes),
  queueEntries: many(matchmakingQueue),
}));

export const quizRelations = relations(quizzes, ({ one, many }) => ({
  questions: many(questions),
  users: one(users, {
    fields: [quizzes.creatorId],
    references: [users.id],
  }),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  answers: many(answers),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const matchmakingQueueRelations = relations(
  matchmakingQueue,
  ({ one }) => ({
    user: one(users, {
      fields: [matchmakingQueue.userId],
      references: [users.id],
    }),
  }),
);

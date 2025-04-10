import { relations } from "drizzle-orm";
import { quizzes, questions, answers, users } from "./schema";

export const userRelations = relations(users, ({ many }) => ({
  quizzes: many(quizzes),
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

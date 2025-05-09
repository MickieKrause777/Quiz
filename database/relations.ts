import { relations } from "drizzle-orm";
import {
  quizzes,
  questions,
  answers,
  users,
  matchmakingQueue,
  matches,
  playerAnswers,
} from "./schema";

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

export const matchRelations = relations(matches, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [matches.quizId],
    references: [quizzes.id],
  }),
  player1: one(users, {
    fields: [matches.player1Id],
    references: [users.id],
  }),
  player2: one(users, {
    fields: [matches.player2Id],
    references: [users.id],
  }),
  currentPlayer: one(users, {
    fields: [matches.currentTurnPlayer],
    references: [users.id],
  }),
  playerAnswers: many(playerAnswers),
}));

export const playerAnswerRelations = relations(playerAnswers, ({ one }) => ({
  match: one(matches, {
    fields: [playerAnswers.matchId],
    references: [matches.id],
  }),
  user: one(users, {
    fields: [playerAnswers.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [playerAnswers.questionId],
    references: [questions.id],
  }),
  answer: one(answers, {
    fields: [playerAnswers.answerId],
    references: [answers.id],
  }),
}));

import { matches, matchmakingQueue, quizzes, users } from "./schema";
import { and, desc, eq, not, or, sql } from "drizzle-orm";
import { db } from "@/database/drizzle";

export const quizQuery = async (search?: string) => {
  const query = db
    .select()
    .from(quizzes)
    .leftJoin(users, eq(quizzes.creatorId, users.id))
    .orderBy(desc(quizzes.createdAt));

  if (search) {
    return query.where(
      or(
        sql`${quizzes.title} ILIKE ${"%" + search + "%"}`,
        sql`${quizzes.category} ILIKE ${"%" + search + "%"}`,
        sql`${users.fullName} ILIKE ${"%" + search + "%"}`,
      ),
    );
  }

  return query;
};

export const quizByIdQuery = async (id: string) => {
  const result = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
    with: {
      users: true,
    },
  });

  if (!result) {
    throw new Error("Quiz not found");
  }

  return result;
};

export const questionByQuizIdQuery = async (id: string) => {
  const result = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
    with: {
      users: true,
      questions: {
        with: {
          answers: true,
        },
      },
    },
  });

  if (!result) {
    throw new Error("Questions not found");
  }

  return result;
};

export const waitingMatchmakingQueuesByUserIdQuery = async (userId: string) => {
  const result = await db.query.matchmakingQueue.findMany({
    where: and(
      eq(matchmakingQueue.userId, userId),
      eq(matchmakingQueue.status, "waiting"),
    ),
  });

  if (!result) {
    throw new Error("Queues not found");
  }

  return result;
};

export const getOngoingMatchesByUserIdQuery = async (userId: string) => {
  const result = await db.query.matches.findMany({
    where: and(
      or(eq(matches.player1Id, userId), eq(matches.player2Id, userId)),
      not(eq(matches.status, "waiting")),
    ),
    with: {
      quiz: true,
    },
  });

  if (!result) {
    throw new Error("Matches not found");
  }

  return result;
};

export const getMatchData = async (matchId: string) => {
  const result = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
    with: {
      quiz: {
        with: {
          questions: {
            with: {
              answers: true,
            },
          },
        },
      },
      player1: true,
      player2: true,
    },
  });

  if (!result) {
    throw new Error("Match not found");
  }

  return result;
};

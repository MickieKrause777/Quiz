"use server";

import { getSessionUser } from "@/lib/actions/auth";
import { db } from "@/database/drizzle";
import { matches, playerAnswers, questions } from "@/database/schema";
import { and, countDistinct, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { MAX_ROUNDS, QUESTIONS_PER_ROUND } from "@/constants/multiplayer";

export async function submitMultiplayerAnswer({
  matchId,
  questionId,
  answerId,
  isCorrect,
  roundNumber,
}: MultiplayerAnswerParams) {
  const user = await getSessionUser();

  try {
    await db.transaction(async (tx) => {
      const match = await tx.query.matches.findFirst({
        where: eq(matches.id, matchId),
      });

      if (!match) {
        throw new Error("Match not found");
      }

      if (match.player1Id !== user!.id && match.player2Id !== user!.id) {
        throw new Error("Not authorized for this match");
      }

      if (match.currentTurnPlayer !== user!.id) {
        throw new Error("Not your turn");
      }

      const existingAnswer = await tx.query.playerAnswers.findFirst({
        where: and(
          eq(playerAnswers.matchId, matchId),
          eq(playerAnswers.userId, user!.id),
          eq(playerAnswers.questionId, questionId),
          eq(playerAnswers.roundNumber, roundNumber),
        ),
      });

      if (existingAnswer) {
        return {
          success: true,
          alreadyAnswered: true,
          existingAnswer,
        };
      }

      const scoreToAdd = isCorrect ? 15 : 0;
      const scoreField =
        match.player1Id === user!.id ? "player1Score" : "player2Score";
      const currentScore =
        match.player1Id === user!.id ? match.player1Score : match.player2Score;

      await tx.insert(playerAnswers).values({
        matchId,
        userId: user!.id,
        questionId,
        answerId,
        isCorrect,
        roundNumber,
      });

      if (scoreToAdd > 0) {
        await tx
          .update(matches)
          .set({ [scoreField]: currentScore! + scoreToAdd })
          .where(eq(matches.id, matchId));
      }
    });

    revalidatePath(`/multiplayer/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
}

export async function getPlayerAnswers(matchId: string, roundNumber: number) {
  const user = await getSessionUser();

  try {
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
    });

    if (!match) {
      throw new Error("Match not found");
    }

    if (match.player1Id !== user!.id && match.player2Id !== user!.id) {
      throw new Error("Not authorized for this match");
    }

    const answers = await db.query.playerAnswers.findMany({
      where: and(
        eq(playerAnswers.matchId, matchId),
        eq(playerAnswers.userId, user!.id),
        eq(playerAnswers.roundNumber, roundNumber),
      ),
    });

    return {
      success: true,
      answers,
      roundScore: answers.reduce(
        (total, answer) => total + (answer.isCorrect ? 15 : 0),
        0,
      ),
    };
  } catch (error) {
    console.error("Error getting player answers:", error);
    throw error;
  }
}

export async function endPlayerTurn(matchId: string) {
  const user = await getSessionUser();

  try {
    const updatedMatch = await db.transaction(async (tx) => {
      const match = await tx.query.matches.findFirst({
        where: eq(matches.id, matchId),
        with: {
          quiz: {
            columns: {
              id: true,
            },
          },
        },
      });

      if (!match) {
        throw new Error("Match not found");
      }

      if (match.currentTurnPlayer !== user!.id) {
        throw new Error("Not your turn");
      }

      const nextPlayerId =
        match.currentTurnPlayer === match.player1Id
          ? match.player2Id
          : match.player1Id;

      const totalQuestions = await tx
        .select({
          count: countDistinct(questions.id),
        })
        .from(questions)
        .where(eq(questions.quizId, match.quiz.id));

      const answeredQuestions = await tx
        .select({
          count: countDistinct(playerAnswers.questionId),
        })
        .from(playerAnswers)
        .where(
          and(
            eq(playerAnswers.matchId, matchId),
            eq(playerAnswers.userId, nextPlayerId),
          ),
        );

      const totalQuestionsCount = totalQuestions[0]?.count || 0;
      const answeredQuestionsCount = answeredQuestions[0]?.count || 0;

      const newRoundNumber =
        match.currentTurnPlayer === match.player2Id
          ? match.roundNumber! + 1
          : match.roundNumber!;

      let status = match.status;
      let completedAt = match.completedAt;

      const shouldEndMatch =
        newRoundNumber > MAX_ROUNDS ||
        answeredQuestionsCount >= totalQuestionsCount;

      if (shouldEndMatch) {
        status = "completed";
        completedAt = new Date();
      }

      const [updated] = await tx
        .update(matches)
        .set({
          currentTurnPlayer: nextPlayerId,
          roundNumber: newRoundNumber,
          status,
          completedAt,
        })
        .where(eq(matches.id, matchId))
        .returning();

      return updated;
    });

    revalidatePath(`/multiplayer/${matchId}`);
    return {
      success: true,
      match: updatedMatch,
    };
  } catch (error) {
    console.error("End turn error:", error);
    throw error;
  }
}

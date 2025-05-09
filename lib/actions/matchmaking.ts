"use server";
import { getSessionUser } from "@/lib/actions/auth";
import { matches, matchmakingQueue, quizzes } from "@/database/schema";
import { db } from "@/database/drizzle";
import { and, desc, eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type MatchmakingResponse = {
  success: boolean;
  message?: string;
  matchId?: string;
};

export async function joinMatchmaking(
  category: string,
): Promise<MatchmakingResponse> {
  try {
    const user = await getSessionUser();

    const existingQueueEntry = await db.query.matchmakingQueue.findFirst({
      where: and(
        eq(matchmakingQueue.userId, user!.id),
        eq(matchmakingQueue.category, category),
        eq(matchmakingQueue.status, "waiting"),
      ),
    });

    if (existingQueueEntry) {
      return {
        success: false,
        message: "Your already in matchmaking queue with this category!",
      };
    }

    const [queueEntry] = await db
      .insert(matchmakingQueue)
      .values({
        userId: user!.id,
        category: category,
      })
      .returning();

    const result = await findMatch(user!.id, category);

    return result;
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to join matchmaking queue",
    };
  }
}

export async function findMatch(userId: string, category: string) {
  try {
    const opponent = await db.query.matchmakingQueue.findFirst({
      where: and(
        eq(matchmakingQueue.category, category),
        eq(matchmakingQueue.status, "waiting"),
        not(eq(matchmakingQueue.userId, userId)),
      ),
      orderBy: [desc(matchmakingQueue.joinedAt)],
    });

    if (!opponent) {
      return {
        success: false,
        message:
          "You have been added to the matchmaking queue. No opponent currently found",
      };
    }

    const randomQuizByCategory = await selectRandomQuizByCategory(category);

    if (!randomQuizByCategory) {
      return {
        success: false,
        message: "No Quiz found!",
      };
    }

    const [match] = await db
      .insert(matches)
      .values({
        quizId: randomQuizByCategory?.id,
        player1Id: userId,
        player2Id: opponent.userId,
        currentTurnPlayer: userId,
        status: "in_progress",
      })
      .returning();

    await db
      .update(matchmakingQueue)
      .set({ status: "matched" })
      .where(
        and(
          eq(matchmakingQueue.userId, userId),
          eq(matchmakingQueue.category, category),
        ),
      );

    await db
      .update(matchmakingQueue)
      .set({ status: "matched" })
      .where(
        and(
          eq(matchmakingQueue.userId, userId),
          eq(matchmakingQueue.category, category),
        ),
      );

    return {
      success: true,
      matchId: match.id,
    };
  } catch (error) {
    console.error("Matchmaking error:", error);
    return {
      success: false,
      message: "An error occurred during matchmaking",
    };
  }
}

export async function selectRandomQuizByCategory(category: string) {
  try {
    const quizzesInCategory = await db.query.quizzes.findMany({
      where: eq(quizzes.category, category),
    });

    const randomIndex = Math.floor(Math.random() * quizzesInCategory.length);

    const randomQuiz = quizzesInCategory[randomIndex];

    return randomQuiz;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteMatchmakingQueueEntry(category: string) {
  const user = await getSessionUser();

  await db
    .update(matchmakingQueue)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(matchmakingQueue.userId, user!.id),
        eq(matchmakingQueue.category, category),
      ),
    );

  revalidatePath("/matchmaking");
  return { success: true };
}

"use server";
import { getSessionUser } from "@/lib/actions/auth";
import { matchmakingQueue } from "@/database/schema";
import { db } from "@/database/drizzle";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function joinMatchmaking(category: string) {
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

    // TODO: implement find match
    return {
      success: true,
      queueEntry: queueEntry,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to join matchmaking queue",
    };
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

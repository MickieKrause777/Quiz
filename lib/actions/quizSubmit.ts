"use server";
import { auth } from "@/auth";
import { users } from "@/database/schema";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";

export const handleQuizSubmit = async (QuizXp: number) => {
  const session = await auth();

  if (!session?.user?.email) {
    console.error("User not authenticated");
    return;
  }

  try {
    const userResult = await db.query.users.findFirst({
      where: eq(users.email, session?.user?.email),
    });

    if (!userResult) {
      console.error("User not found");
      return;
    }

    const newXp = (userResult.xp ?? 0) + QuizXp;

    await db
      .update(users)
      .set({ xp: newXp })
      .where(eq(users.id, userResult.id));

    return newXp;
  } catch (error) {
    console.error("Error on updating XP:", error);
  }
};

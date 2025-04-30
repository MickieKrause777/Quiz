"use server";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { answers, questions, quizzes, users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function createQuizAction(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "You must be logged in to create a quiz",
      };
    }

    const creator = await db.query.users.findFirst({
      where: eq(users.email, session?.user?.email),
    });

    if (!creator) {
      console.error("User not found");
      return;
    }

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title: data.title,
        description: data.description,
        category: data.category,
        creatorId: creator.id,
      })
      .returning({ id: quizzes.id });

    for (const questionData of data.questions) {
      const [newQuestion] = await db
        .insert(questions)
        .values({
          question: questionData.question,
          quizId: newQuiz.id,
        })
        .returning();

      for (const answerData of questionData.answers) {
        await db.insert(answers).values({
          text: answerData.text,
          description: answerData.description || "",
          isCorrect: answerData.isCorrect,
          questionId: newQuestion.id,
        });
      }
    }
    return { success: true, quizId: newQuiz.id };
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return { success: false, error: (error as Error).message };
  }
}

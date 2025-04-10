import { quizzes, users } from "./schema";
import { desc, eq, or, sql } from "drizzle-orm";
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

  return result;
};

import React from "react";
import Ping from "@/components/Ping";
import { quizByIdQuery } from "@/database/queries";
import { quizzes } from "@/database/schema";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";

const View = async ({ id }: { id: string }) => {
  const { views: totalViews }  = await quizByIdQuery(id);

  await db
    .update(quizzes)
    .set({ views: totalViews + 1 })
    .where(eq(quizzes.id, id));

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>

      <p className="view-text">
        <span className="font-black">Views: {totalViews}</span>
      </p>
    </div>
  );
};
export default View;

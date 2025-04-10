import React from "react";
import { EyeIcon } from "lucide-react";
import { formateDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const QuizCard = ({ post }: { post: QuizTypeCard }) => {
  const { quizzes, users: author } = post;

  return (
    <>
      <li className="quiz-card group">
        <div className="flex-between">
          <p className="quiz_card_date text-light-600">
            {formateDate(quizzes.createdAt.toString())}
          </p>
          <div className="flex gap-1.5">
            <EyeIcon className="size-6 text-black" />
            <span className="text-16-medium">{quizzes.views}</span>
          </div>
        </div>

        <div className="flex-between mt-5 gap-5">
          <div className="flex-1">
            <Link href={`/user/${author?.id}`}>
              <p className="text-16-medium line-clamp-1">
                Created by: {author?.fullName}
              </p>
            </Link>

            <Link href={`/quiz/${quizzes.id}`}>
              <h3 className="text-26-semibold line-clamp-1">{quizzes.title}</h3>
            </Link>
          </div>
        </div>

        <Link href={`/quiz/${quizzes.id}`}>
          <p className="quiz-card_desc">{quizzes.description}</p>
        </Link>

        <div className="flex-between gap-3 mt-5">
          <Link href={`/?query=${quizzes.category?.toLowerCase()}`}>
            <p className="text-16-medium">{quizzes.category}</p>
          </Link>
          <Button className="btn-primary">
            <Link href={`/quiz/${quizzes.id}`}>Details</Link>
          </Button>
        </div>
      </li>
    </>
  );
};
export default QuizCard;

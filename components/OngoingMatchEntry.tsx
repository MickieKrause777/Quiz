import React from "react";
import { cn, formateDate } from "@/lib/utils";
import { toUpperCase } from "uri-js/dist/esnext/util";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const OngoingMatchEntry = ({
  post,
  user,
}: {
  post: ongoingMatchEntry;
  user: User;
}) => {
  const {
    id,
    createdAt,
    status,
    player1Id,
    player1Score,
    player2Score,
    currentTurnPlayer,
    roundNumber,
    quiz,
  } = post;
  const isPlayer1 = user.id === player1Id;
  const userScore = isPlayer1 ? player1Score : player2Score;
  const isUserTurn = currentTurnPlayer === user.id;

  return (
    <div className="quiz-card m-3 blue-gradient">
      <div className="flex justify-center gap-5">
        <p className="category-tag">
          {quiz.category} / {quiz.title}
        </p>
      </div>

      <div className="flex-between gap-5 mt-2">
        <div>
          <p className="text-16-medium">
            {status === "in_progress"
              ? `Current Round: ${roundNumber}`
              : "Finished"}
          </p>
          <p className="text-16-medium">Your Score: {userScore} </p>
        </div>

        <div className="max-sm:hidden">
          <p className="text-16-medium">
            Created At: {formateDate(createdAt.toString())}
          </p>
          <p className="text-16-medium">Status: {toUpperCase(status)}</p>
        </div>

        {status === "in_progress" ? (
          <div className="mt-3 grid gap-5">
            <Button
              className={`text-16-medium ${
                isUserTurn
                  ? "text-white bg-success-100 hover:bg-success"
                  : "text-white bg-orange-600 hover:bg-orange-600"
              }`}
            >
              {isUserTurn ? "It is your Turn" : "Opponent's Turn"}
            </Button>
            <Link href={`/multiplayer/${id}`}>
              <Button
                className={cn(
                  "btn-secondary",
                  isUserTurn ? "bg-primary" : "bg-secondary",
                )}
              >
                {isUserTurn ? "Play Your Turn" : "View Match"}
              </Button>
            </Link>
          </div>
        ) : (
          <Link href={`/multiplayer/${id}`}>
            <Button className="btn-secondary">View Match History</Button>
          </Link>
        )}
      </div>
    </div>
  );
};
export default OngoingMatchEntry;

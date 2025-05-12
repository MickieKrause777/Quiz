import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MatchSummaryCard = ({
  matchResult,
  userId,
}: {
  matchResult: any;
  userId: string;
}) => {
  console.log(matchResult);
  const {
    player1Id,
    player2Score,
    player1Score,
    player1,
    player2,
    player1Answers,
    player2Answers,
    quiz,
  } = matchResult;
  const isPlayer1 = userId === player1Id;
  const userScore = isPlayer1 ? player1Score : player2Score;
  const opponentScore = isPlayer1 ? player2Score : player1Score;
  const userFullName = isPlayer1 ? player1.fullName : player2.fullName;
  const opponentFullName = isPlayer1 ? player2.fullName : player1.fullName;
  const userAnswers = isPlayer1 ? player1Answers : player2Answers;
  const opponentAnswers = isPlayer1 ? player2Answers : player1Answers;

  const didUserWin = userScore! > opponentScore!;
  const isResultTie = userScore === opponentScore;

  const renderAnswerBreakdown = (
    answers: Array<{ questionId: string; isCorrect: boolean }> = [],
  ) => {
    return (
      <div className="mb-6 border-4 rounded-xl border-light-400">
        {answers.map((answer, index) => {
          const questionText =
            quiz.questions.find((q: Question) => q.id === answer.questionId)
              ?.question || "";
          return (
            <div key={index} className="flex items-center gap-2 m-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${answer.isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
              >
                {answer.isCorrect ? "✓" : "✗"}
              </div>
              <p className="text-16-medium w-full text-center">
                {questionText.substring(0, 50)}
                {questionText.length > 50 ? "..." : ""}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="shadow-2xl mb-5 py-6 flex flex-col items-center rounded-xl border-light-400 border-4">
      <h2 className="heading">Match Completed</h2>

      <div className="w-full px-4 mb-6">
        <h3 className="text-20-semibold text-center mb-4 !text-white">
          {quiz.title}
        </h3>

        <div className="text-center mb-6">
          {isResultTie ? (
            <p className="text-30-bold !text-orange-600">It's a Tie!</p>
          ) : didUserWin ? (
            <p className="text-30-bold text-green-600">You Won!</p>
          ) : (
            <p className="text-30-bold text-red-600">You Lost</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-30-semibold text-light-400 text-center mb-2">
              {userFullName}'s Answers
            </h3>
            {renderAnswerBreakdown(userAnswers)}
          </div>
          <div>
            <h3 className="text-30-semibold text-light-400 text-center mb-2">
              {opponentFullName}'s Answers
            </h3>
            {renderAnswerBreakdown(opponentAnswers)}
          </div>
        </div>
      </div>

      <div className="w-full px-4">
        <Link href="/matchmaking" className="w-full block">
          <Button className="w-full btn-primary">
            Return to Multiplayer Matches
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default MatchSummaryCard;

import { getMatchData } from "@/database/queries";
import { getSessionUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import QuizHeroSection from "@/components/QuizHeroSection";
import MultiplayerQuizCard from "@/components/MultiplayerQuizCard";
import MatchSummaryCard from "@/components/MatchSummaryCard";
import { getMatchAnswers } from "@/lib/actions/multiplayer";
import React from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const match = await getMatchData(id);
  const {
    player1,
    player2,
    player1Score,
    player2Score,
    player1Id,
    player2Id,
    quiz,
    currentTurnPlayer,
    roundNumber,
    status,
  } = match;
  const user = await getSessionUser();

  let matchResult;
  if (status === "completed") {
    matchResult = await getMatchAnswers(id);
  }

  if (player1Id !== user?.id && player2Id !== user?.id) {
    redirect("/");
  }

  const questions = quiz.questions;
  const playerNumber = player1Id === user?.id ? 1 : 2;
  const isPlayerTurn = currentTurnPlayer === user?.id;

  return (
    <>
      <QuizHeroSection post={quiz} />

      <div className="mt-4 mx-2">
        <div className="flex justify-between mb-2 gap-2">
          <div className="px-10 py-3 my-3 text-30-semibold text-light-400 text-center mb-2 blue-gradient rounded-full border-light-400 border-4 p-3">
            <h3>Player 1: {match.player1.fullName}</h3>
            <p className="text-26-medium !text-light-600">
              {player1Score} points
            </p>
          </div>
          <div className="px-10 py-3 my-3 text-30-semibold text-light-400 text-center mb-2 blue-gradient rounded-full border-light-400 border-4 p-3">
            <h3>Player 2: {match.player2.fullName}</h3>
            <p className="text-26-semibold !text-light-600">
              {player2Score} points
            </p>
          </div>
        </div>

        {status === "in_progress" ? (
          <>
            <div className="mb-4 rounded-full bg-primary-200">
              <p className="text-18-semibold py-3 text-center">
                Round {roundNumber} •
                {isPlayerTurn
                  ? " Your turn!"
                  : ` Waiting for ${
                      player1Id === currentTurnPlayer
                        ? player1.fullName
                        : player2.fullName
                    }`}
              </p>
            </div>

            {isPlayerTurn ? (
              <MultiplayerQuizCard
                match={match}
                questions={questions}
                playerNumber={playerNumber}
              />
            ) : (
              <div className="text-center p-8 shadow-xl rounded-lg bg-primary-200">
                <h2 className="text-24-semibold mb-4">Wait for your turn</h2>
                <p className="text-16-medium">
                  Your opponent is currently playing. You'll be notified when
                  it's your turn.
                </p>
              </div>
            )}
          </>
        ) : (
          <MatchSummaryCard matchResult={matchResult} userId={user?.id} />
        )}
      </div>
    </>
  );
};
export default Page;

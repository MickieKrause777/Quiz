"use client";
import { QUESTIONS_PER_ROUND } from "@/constants/multiplayer";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SelectedAnswer = {
  answerId: string;
  isCorrect: boolean;
};

const MultiplayerQuizCard = ({
  match,
  questions,
  playerNumber,
}: MultiplayerQuizProps) => {
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
    id,
  } = match;
  const startingQuestionIndex = useMemo(() => {
    return (
      (roundNumber! - 1) * QUESTIONS_PER_ROUND +
      ((playerNumber === 2 && currentTurnPlayer === player2Id) ||
      (playerNumber === 1 && currentTurnPlayer === player1Id)
        ? 0
        : QUESTIONS_PER_ROUND)
    );
  }, [roundNumber, playerNumber, currentTurnPlayer, player1Id, player2Id]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    startingQuestionIndex,
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, SelectedAnswer>
  >({});
  const [roundScore, setRoundScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] || null,
    [questions, currentQuestionIndex],
  );

  const isCurrentQuestionAnswered = currentQuestionIndex in selectedAnswers;

  const handleAnswerSelect = useCallback(
    async (answerId: string, isCorrect: boolean) => {
      if (isSubmitting || !currentQuestion) return;
      setIsSubmitting(true);

      try {
        setSelectedAnswers((prev) => ({
          ...prev,
          [currentQuestionIndex]: { answerId, isCorrect },
        }));

        if (isCorrect) {
          setRoundScore((prev) => prev + 15);
        }

        // // Submit the answer to the server in parallel
        // await submitMultiplayerAnswer({
        //   matchId: match.id,
        //   questionId: currentQuestion.id,
        //   answerId,
        //   isCorrect,
        //   roundNumber: match.roundNumber,
        // });

        const newAnsweredCount = answeredCount + 1;
        setAnsweredCount(newAnsweredCount);

        if (newAnsweredCount >= QUESTIONS_PER_ROUND) {
          setShowRoundSummary(true);
        }
      } catch (error) {
        toast.error("Failed to submit answer");
        setSelectedAnswers((prev) => {
          const newState = { ...prev };
          delete newState[currentQuestionIndex];
          return newState;
        });
        if (isCorrect) {
          setRoundScore((prev) => prev - 15);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentQuestion,
      currentQuestionIndex,
      answeredCount,
      isSubmitting,
      id,
      roundNumber,
    ],
  );

  const handleNextQuestion = useCallback(() => {
    if (answeredCount >= QUESTIONS_PER_ROUND) {
      setShowRoundSummary(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [answeredCount]);

  if (!currentQuestion) {
    return <div>No more questions available</div>;
  }

  function finishRound() {
    setIsSubmitting(true);
  }

  if (showRoundSummary) {
    return (
      <div className="shadow-2xl mb-5 py-3 flex flex-col items-center rounded-xl border-light-400 border-4">
        <h2 className="text-20-semibold heading px-4">Round Summary</h2>
        <p className="text-16-medium text-center mb-6">
          You scored {roundScore} points this round!
        </p>

        <div className="mb-6">
          {Object.entries(selectedAnswers).map(([index, { isCorrect }]) => {
            const questionIndex = parseInt(index);
            const questionText = questions[questionIndex]?.question || "";
            return (
              <div key={index} className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                >
                  {isCorrect ? "✓" : "✗"}
                </div>
                <p className="text-16-medium">
                  {questionText.substring(0, 50)}
                  {questionText.length > 50 ? "..." : ""}
                </p>
              </div>
            );
          })}
        </div>

        <div className="w-full px-4">
          <Button
            className="w-full btn-primary"
            onClick={finishRound}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "End Your Turn"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-2xl mb-5 py-3 flex flex-col items-center rounded-xl border-light-400 border-4">
      <div className="w-full flex justify-between px-4 mb-4">
        <p className="text-16-medium">
          Question {answeredCount} of {QUESTIONS_PER_ROUND}
        </p>
        <p className="text-16-medium">Round Score: {roundScore}</p>
      </div>

      <h1 className="text-20-semibold heading px-4">
        {currentQuestion.question}
      </h1>

      <ul className="gap-5 grid grid-cols-1 w-full mb-1 mt-5">
        {currentQuestion.answers.map((answer) => {
          const isSelected =
            isCurrentQuestionAnswered &&
            selectedAnswers[currentQuestionIndex].answerId === answer.id;

          return (
            <div className="w-full px-3" key={answer.id}>
              <Button
                className={cn(
                  "bg-primary-100 hover:bg-primary w-full",
                  isCurrentQuestionAnswered && isSelected
                    ? answer.isCorrect
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    : "",
                  isCurrentQuestionAnswered && !isSelected && answer.isCorrect
                    ? "bg-green-600 text-white"
                    : "",
                )}
                onClick={() =>
                  !isCurrentQuestionAnswered &&
                  !isSubmitting &&
                  handleAnswerSelect(answer.id, answer.isCorrect)
                }
                disabled={isCurrentQuestionAnswered || isSubmitting}
              >
                {answer.text}
              </Button>
              {isCurrentQuestionAnswered && (
                <p className="text-center text-14-normal mt-1">
                  {answer.description}
                </p>
              )}
            </div>
          );
        })}
      </ul>
      <div className="flex-between w-full px-3 my-8">
        <Button
          onClick={handleNextQuestion}
          disabled={!isCurrentQuestionAnswered || isSubmitting}
          className="btn-secondary w-full"
        >
          {"Next Question"}
        </Button>
      </div>
    </div>
  );
};
export default MultiplayerQuizCard;

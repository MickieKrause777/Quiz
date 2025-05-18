"use client";
import {
  QUESTIONS_PER_ROUND,
  XP_PER_CORRECT_ANSWER,
} from "@/constants/multiplayer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  endPlayerTurn,
  getPlayerAnswers,
  submitMultiplayerAnswer,
} from "@/lib/actions/multiplayer";

type SelectedAnswer = {
  answerId: string;
  isCorrect: boolean;
};

const MultiplayerQuizCard = ({
  match,
  questions,
  playerNumber,
}: MultiplayerQuizProps) => {
  const { player1Id, player2Id, currentTurnPlayer, roundNumber, id } = match;
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
  const [isLoading, setIsLoading] = useState(true);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] || null,
    [questions, currentQuestionIndex],
  );

  const isCurrentQuestionAnswered = currentQuestionIndex in selectedAnswers;

  useEffect(() => {
    const loadPreviousAnswers = async () => {
      setIsLoading(true);
      try {
        const result = await getPlayerAnswers(match.id, match.roundNumber!);

        if (result.answers.length > 0) {
          const loadedAnswers: Record<number, SelectedAnswer> = {};
          let highestIndex = startingQuestionIndex;

          result.answers.forEach((answer) => {
            const questionIndex = questions.findIndex(
              (q) => q.id === answer.questionId,
            );
            if (questionIndex !== -1) {
              loadedAnswers[questionIndex] = {
                answerId: answer.answerId,
                isCorrect: answer.isCorrect,
              };

              if (questionIndex > highestIndex) {
                highestIndex = questionIndex;
              }
            }
          });

          setSelectedAnswers(loadedAnswers);
          setRoundScore(result.roundScore);
          setAnsweredCount(result.answers.length);

          if (result.answers.length >= QUESTIONS_PER_ROUND) {
            setShowRoundSummary(true);
          }
        }
      } catch (error) {
        console.error("Failed to load previous answers:", error);
        toast.error("Failed to load your previous answers");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviousAnswers();
  }, [match.id, match.roundNumber, startingQuestionIndex, questions]);

  useEffect(() => {
    if (answeredCount >= QUESTIONS_PER_ROUND && !showRoundSummary) {
      setShowRoundSummary(true);
    }
  }, [answeredCount, showRoundSummary]);

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
          setRoundScore((prev) => prev + XP_PER_CORRECT_ANSWER);
        }

        await submitMultiplayerAnswer({
          matchId: match.id,
          questionId: currentQuestion.id,
          answerId,
          isCorrect,
          roundNumber: match.roundNumber,
        } as MultiplayerAnswerParams);

        const newAnsweredCount = answeredCount + 1;
        setAnsweredCount(newAnsweredCount);
      } catch (error) {
        console.log(error);
        toast.error("Failed to submit answer");
        setSelectedAnswers((prev) => {
          const newState = { ...prev };
          delete newState[currentQuestionIndex];
          return newState;
        });
        if (isCorrect) {
          setRoundScore((prev) => prev - XP_PER_CORRECT_ANSWER);
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

  const finishRound = async () => {
    setIsSubmitting(true);
    try {
      await endPlayerTurn(match.id, roundScore);
      toast.success("Round completed. Waiting for opponent's turn.");
    } catch (error) {
      console.error("Failed to finish round:", error);
      toast.error("Failed to complete the round");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {!isLoading && (
          <Button
            onClick={handleNextQuestion}
            disabled={!isCurrentQuestionAnswered || isSubmitting}
            className="btn-secondary w-full"
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
};
export default MultiplayerQuizCard;

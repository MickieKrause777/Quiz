"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleQuizSubmit } from "@/lib/actions/quizSubmit";

const QuestionCard = ({ post }: { post: Question[] }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const question = post[currentQuestion];
  const { question: title, answers } = question;
  const [answeredQuestions, setAnsweredQuestions] = useState([{}]);
  const [correctQuestions, setCorrectQuestions] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: { answer: string };
  }>({});
  const router = useRouter();

  const checkAnswer = (title: string) => () => {
    setSelectedAnswers((prevSelectedAnswers) => ({
      ...prevSelectedAnswers,
      [currentQuestion]: { answer: title },
    }));
    setAnsweredQuestions((prevAnsweredQuestions) => [
      ...prevAnsweredQuestions,
      question,
    ]);
    if (title === question.answers.find((a) => a.isCorrect)?.text) {
      setCorrectQuestions((prevCorrectQuestions) => prevCorrectQuestions + 1);
    }
  };

  async function submitQuiz() {
    const QuizXp = correctQuestions * 15;

    const result = handleQuizSubmit(QuizXp);

    toast.success(
      `Great! You got  ${correctQuestions} correct answers, earned ${QuizXp} XP and will be redirected!`,
    );

    setTimeout(() => {
      router.push(`/`);
    }, 3000);

    return result;
  }

  return (
    <>
      <div className="shadow-2xl mb-5 py-3 flex flex-col items-center">
        <h1 className="text-20-semibold heading">{title}</h1>
        <ul className="gap-5 grid grid-cols-1 w-full mb-1 mt-5">
          {answers.map((answer) => (
            <div className="w-full px-3" key={answer.id}>
              <Button
                className={cn(
                  "bg-primary-100 hover:bg-primary w-full",
                  answeredQuestions.includes(question) ? !answer.isCorrect
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white" : "",
                )}
                onClick={checkAnswer(answer.text)}
                disabled={answeredQuestions.includes(question)}
              >
                {answer.text}
              </Button>
              {answeredQuestions.includes(question) && (
                <p className="text-center text-14-normal">
                  {answer.description}
                </p>
              )}
            </div>
          ))}
        </ul>

        {answeredQuestions.includes(question) && (
          <p
            className={cn(
              "sub-heading px-4 py-2 mt-5 rounded-full",
              selectedAnswers[currentQuestion].answer ===
                question.answers.find((a) => a.isCorrect)?.text
                ? "bg-green-600"
                : "bg-red-900",
            )}
          >
            Your Answer: {selectedAnswers[currentQuestion].answer}
          </p>
        )}

        <div className="flex-between w-full px-3 my-8">
          <Button
            onClick={() =>
              setCurrentQuestion((prevQuestion) =>
                prevQuestion > 0 ? prevQuestion - 1 : prevQuestion,
              )
            }
          >
            Previous Question
          </Button>
          <Button
            onClick={() =>
              setCurrentQuestion((prevQuestion) =>
                prevQuestion < post.length - 1
                  ? prevQuestion + 1
                  : prevQuestion,
              )
            }
          >
            Next Question
          </Button>
        </div>
        <Button className="h-20 w-80" type="submit" onClick={submitQuiz}>
          Submit your Answers!
        </Button>
      </div>
    </>
  );
};
export default QuestionCard;

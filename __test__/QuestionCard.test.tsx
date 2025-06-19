import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QuestionCard from "@/components/QuestionCard";
import { handleQuizSubmit } from "@/lib/actions/quizSubmit";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/actions/quizSubmit", () => ({
  handleQuizSubmit: jest.fn(),
}));

jest.mock("@/constants/multiplayer", () => ({
  XP_PER_CORRECT_ANSWER: 10,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={props["data-testid"]}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

describe("QuestionCard Component", () => {
  const mockPush = jest.fn();
  const mockHandleQuizSubmit = handleQuizSubmit as jest.MockedFunction<
    typeof handleQuizSubmit
  >;
  const mockToastSuccess = toast.success as jest.MockedFunction<
    typeof toast.success
  >;

  const mockQuestions: Question[] = [
    {
      id: "1",
      question: "What is 2 + 2?",
      quizId: "quiz-1",
      answers: [
        {
          id: "a1",
          text: "3",
          description: "Incorrect. 2 + 2 equals 4.",
          isCorrect: false,
          questionId: "1",
        },
        {
          id: "a2",
          text: "4",
          description: "Correct! 2 + 2 equals 4.",
          isCorrect: true,
          questionId: "1",
        },
        {
          id: "a3",
          text: "5",
          description: "Incorrect. 2 + 2 equals 4.",
          isCorrect: false,
          questionId: "1",
        },
      ],
    },
    {
      id: "2",
      question: "What is the capital of France?",
      quizId: "quiz-1",
      answers: [
        {
          id: "a4",
          text: "London",
          description: "Incorrect. London is the capital of England.",
          isCorrect: false,
          questionId: "2",
        },
        {
          id: "a5",
          text: "Paris",
          description: "Correct! Paris is the capital of France.",
          isCorrect: true,
          questionId: "2",
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Initial Render", () => {
    it("should render the first question correctly", () => {
      render(<QuestionCard post={mockQuestions} />);

      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should disable Previous Question button on first question", () => {
      render(<QuestionCard post={mockQuestions} />);

      const prevButton = screen.getByText("Previous Question");
      expect(prevButton).toBeDisabled();
    });

    it("should enable Next Question button when not on last question", () => {
      render(<QuestionCard post={mockQuestions} />);

      const nextButton = screen.getByText("Next Question");
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("Answer Selection", () => {
    it("should allow selecting an answer and show feedback", () => {
      render(<QuestionCard post={mockQuestions} />);

      const correctAnswer = screen.getByText("4");
      fireEvent.click(correctAnswer);

      // Should show description after answering
      expect(screen.getByText("Correct! 2 + 2 equals 4.")).toBeInTheDocument();

      // Should show selected answer
      expect(screen.getByText("Your Answer: 4")).toBeInTheDocument();
    });

    it("should disable answer buttons after selection", () => {
      render(<QuestionCard post={mockQuestions} />);

      const answer = screen.getByText("4");
      fireEvent.click(answer);

      // All answer buttons should be disabled
      const answerButtons = screen
        .getAllByRole("button")
        .filter((btn) => ["3", "4", "5"].includes(btn.textContent || ""));
      answerButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should show correct styling for correct answer", () => {
      render(<QuestionCard post={mockQuestions} />);

      const correctAnswer = screen.getByText("4");
      fireEvent.click(correctAnswer);

      expect(correctAnswer).toHaveClass("bg-green-600 text-white");
    });

    it("should show correct styling for incorrect answers", () => {
      render(<QuestionCard post={mockQuestions} />);

      const incorrectAnswer = screen.getByText("3");
      fireEvent.click(incorrectAnswer);

      expect(incorrectAnswer).toHaveClass("bg-red-600 text-white");
    });
  });

  describe("Navigation", () => {
    it("should navigate to next question", () => {
      render(<QuestionCard post={mockQuestions} />);

      const nextButton = screen.getByText("Next Question");
      fireEvent.click(nextButton);

      expect(
        screen.getByText("What is the capital of France?"),
      ).toBeInTheDocument();
    });

    it("should navigate back to previous question", () => {
      render(<QuestionCard post={mockQuestions} />);

      // Go to second question first
      const nextButton = screen.getByText("Next Question");
      fireEvent.click(nextButton);

      // Then go back
      const prevButton = screen.getByText("Previous Question");
      fireEvent.click(prevButton);

      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    });

    it("should disable Next Question button on last question", () => {
      render(<QuestionCard post={mockQuestions} />);

      // Navigate to last question
      const nextButton = screen.getByText("Next Question");
      fireEvent.click(nextButton);

      expect(nextButton).toBeDisabled();
    });
  });

  describe("Quiz Submission", () => {
    it("should submit quiz with correct score calculation", async () => {
      mockHandleQuizSubmit.mockResolvedValue(100);
      render(<QuestionCard post={mockQuestions} />);

      // Answer first question correctly
      fireEvent.click(screen.getByText("4"));

      // Navigate to second question
      fireEvent.click(screen.getByText("Next Question"));

      // Answer second question correctly
      fireEvent.click(screen.getByText("Paris"));

      // Submit quiz
      const submitButton = screen.getByText("Submit your Answers!");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockHandleQuizSubmit).toHaveBeenCalledWith(20); // 2 correct * 10 XP
      });
    });

    it("should show success toast with correct message", async () => {
      mockHandleQuizSubmit.mockResolvedValue(100);
      render(<QuestionCard post={mockQuestions} />);

      // Answer one question correctly
      fireEvent.click(screen.getByText("4"));

      // Submit quiz
      const submitButton = screen.getByText("Submit your Answers!");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Great! You got  1 correct answer, earned 10 XP and will be redirected!",
        );
      });
    });

    it("should handle plural correct answers in toast message", async () => {
      mockHandleQuizSubmit.mockResolvedValue(100);
      render(<QuestionCard post={mockQuestions} />);

      // Answer both questions correctly
      fireEvent.click(screen.getByText("4"));
      fireEvent.click(screen.getByText("Next Question"));
      fireEvent.click(screen.getByText("Paris"));

      // Submit quiz
      const submitButton = screen.getByText("Submit your Answers!");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Great! You got  2 correct answers, earned 20 XP and will be redirected!",
        );
      });
    });

    it("should redirect to home page after submission", async () => {
      mockHandleQuizSubmit.mockResolvedValue(100);
      render(<QuestionCard post={mockQuestions} />);

      const submitButton = screen.getByText("Submit your Answers!");
      fireEvent.click(submitButton);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle single question quiz", () => {
      const singleQuestion = [mockQuestions[0]];
      render(<QuestionCard post={singleQuestion} />);

      expect(screen.getByText("Previous Question")).toBeDisabled();
      expect(screen.getByText("Next Question")).toBeDisabled();
    });

    it("should calculate score correctly with no correct answers", async () => {
      mockHandleQuizSubmit.mockResolvedValue(0);
      render(<QuestionCard post={mockQuestions} />);

      // Answer incorrectly
      fireEvent.click(screen.getByText("3"));

      // Submit quiz
      const submitButton = screen.getByText("Submit your Answers!");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockHandleQuizSubmit).toHaveBeenCalledWith(0);
      });
    });
  });
});

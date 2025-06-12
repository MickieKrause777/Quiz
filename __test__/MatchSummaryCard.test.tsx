import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MatchSummaryCard from "@/components/MatchSummaryCard";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

// Mock the Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className }: any) => (
    <button className={className}>{children}</button>
  ),
}));

// Define Question type for TypeScript
interface Question {
  id: string;
  question: string;
}

describe("MatchSummaryCard", () => {
  const mockQuiz = {
    id: "quiz1",
    title: "Science Quiz",
    questions: [
      { id: "q1", question: "What is the chemical symbol for water?" },
      { id: "q2", question: "What planet is known as the Red Planet?" },
      { id: "q3", question: "What is the speed of light in vacuum?" },
    ] as Question[],
  };

  const mockPlayer1 = {
    id: "player1",
    fullName: "John Doe",
  };

  const mockPlayer2 = {
    id: "player2",
    fullName: "Jane Smith",
  };

  const mockPlayer1Answers = [
    { questionId: "q1", isCorrect: true },
    { questionId: "q2", isCorrect: false },
    { questionId: "q3", isCorrect: true },
  ];

  const mockPlayer2Answers = [
    { questionId: "q1", isCorrect: true },
    { questionId: "q2", isCorrect: true },
    { questionId: "q3", isCorrect: false },
  ];

  const createMockMatchResult = (overrides = {}) => ({
    player1Id: "player1",
    player1Score: 5,
    player2Score: 3,
    player1: mockPlayer1,
    player2: mockPlayer2,
    player1Answers: mockPlayer1Answers,
    player2Answers: mockPlayer2Answers,
    quiz: mockQuiz,
    ...overrides,
  });

  describe("Rendering", () => {
    it("should render the component with basic elements", () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("Match Completed")).toBeInTheDocument();
      expect(screen.getByText("Science Quiz")).toBeInTheDocument();
      expect(
        screen.getByText("Return to Multiplayer Matches"),
      ).toBeInTheDocument();
    });

    it("should render the quiz title", () => {
      const matchResult = createMockMatchResult({
        quiz: { ...mockQuiz, title: "Custom Quiz Title" },
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("Custom Quiz Title")).toBeInTheDocument();
    });

    it("should render player names in answer sections", () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("John Doe's Answers")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith's Answers")).toBeInTheDocument();
    });
  });

  describe("Win/Loss/Tie Logic", () => {
    it("should display 'You Won!' when user has higher score", () => {
      const matchResult = createMockMatchResult({
        player1Score: 10,
        player2Score: 5,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("You Won!")).toBeInTheDocument();
      expect(screen.getByText("You Won!")).toHaveClass("text-green-600");
    });

    it("should display 'You Lost' when user has lower score", () => {
      const matchResult = createMockMatchResult({
        player1Score: 3,
        player2Score: 8,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("You Lost")).toBeInTheDocument();
      expect(screen.getByText("You Lost")).toHaveClass("text-red-600");
    });

    it("should display 'It's a Tie!' when scores are equal", () => {
      const matchResult = createMockMatchResult({
        player1Score: 5,
        player2Score: 5,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("It's a Tie!")).toBeInTheDocument();
      expect(screen.getByText("It's a Tie!")).toHaveClass("!text-orange-600");
    });
  });

  describe("Player Perspective", () => {
    it("should work correctly when user is player1", () => {
      const matchResult = createMockMatchResult({
        player1Score: 8,
        player2Score: 3,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("You Won!")).toBeInTheDocument();
      expect(screen.getByText("John Doe's Answers")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith's Answers")).toBeInTheDocument();
    });

    it("should work correctly when user is player2", () => {
      const matchResult = createMockMatchResult({
        player1Score: 3,
        player2Score: 8,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player2" />);

      expect(screen.getByText("You Won!")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith's Answers")).toBeInTheDocument();
      expect(screen.getByText("John Doe's Answers")).toBeInTheDocument();
    });

    it("should show correct opponent name when user is player2", () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="player2" />);

      // When user is player2, opponent is player1 (John Doe)
      expect(screen.getByText("Jane Smith's Answers")).toBeInTheDocument();
      expect(screen.getByText("John Doe's Answers")).toBeInTheDocument();
    });
  });

  describe("Answer Breakdown", () => {
    it("should render correct/incorrect indicators", () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      // Check for checkmarks and X marks
      const checkmarks = screen.getAllByText("✓");
      const xMarks = screen.getAllByText("✗");

      expect(checkmarks.length).toBeGreaterThan(0);
      expect(xMarks.length).toBeGreaterThan(0);
    });

    it("should render question text (truncated)", async () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      const q1Texts = await screen.findAllByText(
        "What is the chemical symbol for water?",
      );
      const q2Texts = await screen.findAllByText(
        "What planet is known as the Red Planet?",
      );

      expect(q1Texts.length).toBeGreaterThanOrEqual(2);
      expect(q2Texts.length).toBeGreaterThanOrEqual(2);
    });

    it("should truncate long question text", () => {
      const longQuestionQuiz = {
        ...mockQuiz,
        questions: [
          {
            id: "q1",
            question:
              "This is a very long question that should be truncated because it exceeds fifty characters",
          },
        ] as Question[],
      };

      const matchResult = createMockMatchResult({
        quiz: longQuestionQuiz,
        player1Answers: [{ questionId: "q1", isCorrect: true }],
        player2Answers: [{ questionId: "q1", isCorrect: false }],
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      const longQuestionText = screen.getAllByText(
        "This is a very long question that should be trunca...",
      );

      expect(longQuestionText.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle empty answers array", () => {
      const matchResult = createMockMatchResult({
        player1Answers: [],
        player2Answers: [],
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("Match Completed")).toBeInTheDocument();
      // Component should still render without errors
    });

    it("should handle missing question in quiz", () => {
      const matchResult = createMockMatchResult({
        player1Answers: [{ questionId: "nonexistent", isCorrect: true }],
        player2Answers: [{ questionId: "nonexistent", isCorrect: false }],
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      // Should render empty string for missing question
      expect(screen.getByText("Match Completed")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should render return to multiplayer matches link", () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      const link = screen
        .getByText("Return to Multiplayer Matches")
        .closest("a");
      expect(link).toHaveAttribute("href", "/matchmaking");
    });

    it("should have correct button styling", () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      const button = screen.getByText("Return to Multiplayer Matches");
      expect(button).toHaveClass("btn-primary");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined scores", () => {
      const matchResult = createMockMatchResult({
        player1Score: undefined,
        player2Score: undefined,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("It's a Tie!")).toBeInTheDocument();
    });

    it("should handle null scores", () => {
      const matchResult = createMockMatchResult({
        player1Score: null,
        player2Score: null,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("It's a Tie!")).toBeInTheDocument();
    });

    it("should handle mixed null/undefined scores", () => {
      const matchResult = createMockMatchResult({
        player1Score: 5,
        player2Score: null,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      expect(screen.getByText("You Won!")).toBeInTheDocument();
    });

    it("should handle user ID that doesn't match either player", () => {
      const matchResult = createMockMatchResult();

      render(<MatchSummaryCard matchResult={matchResult} userId="unknown" />);

      // Should default to player2 perspective
      expect(screen.getByText("You Lost")).toBeInTheDocument();
    });
  });

  describe("Styling Classes", () => {
    it("should apply correct CSS classes to main container", () => {
      const matchResult = createMockMatchResult();

      const { container } = render(
        <MatchSummaryCard matchResult={matchResult} userId="player1" />,
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass(
        "shadow-2xl",
        "mb-5",
        "py-6",
        "flex",
        "flex-col",
        "items-center",
        "rounded-xl",
        "border-light-400",
        "border-4",
        "dark-gradient",
      );
    });

    it("should apply correct classes to win text", () => {
      const matchResult = createMockMatchResult({
        player1Score: 10,
        player2Score: 5,
      });

      render(<MatchSummaryCard matchResult={matchResult} userId="player1" />);

      const winText = screen.getByText("You Won!");
      expect(winText).toHaveClass("text-30-bold", "text-green-600");
    });

    it("should apply correct classes to correct answer indicators", () => {
      const matchResult = createMockMatchResult();

      const { container } = render(
        <MatchSummaryCard matchResult={matchResult} userId="player1" />,
      );

      const correctIndicators = container.querySelectorAll(".bg-green-500");
      expect(correctIndicators.length).toBeGreaterThan(0);
    });
  });
});

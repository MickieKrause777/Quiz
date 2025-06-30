import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { toast } from "sonner";
import MultiplayerQuizCard from "@/components/MultiplayerQuizCard";
import * as multiplayerActions from "@/lib/actions/multiplayer";
import {
  QUESTIONS_PER_ROUND,
  XP_PER_CORRECT_ANSWER,
} from "@/constants/multiplayer";

// Mock the dependencies
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/actions/multiplayer", () => ({
  submitMultiplayerAnswer: jest.fn(),
  getPlayerAnswers: jest.fn(),
  endPlayerTurn: jest.fn(),
}));

// Define test data
const mockQuestions: Question[] = [
  {
    id: "q1",
    question: "Test Question 1",
    quizId: "quiz1",
    answers: [
      {
        id: "a1",
        text: "Answer 1",
        description: "Description 1",
        isCorrect: true,
        questionId: "q1",
      },
      {
        id: "a2",
        text: "Answer 2",
        description: "Description 2",
        isCorrect: false,
        questionId: "q1",
      },
    ],
  },
  {
    id: "q2",
    question: "Test Question 2",
    quizId: "quiz1",
    answers: [
      {
        id: "a3",
        text: "Answer 3",
        description: "Description 3",
        isCorrect: false,
        questionId: "q2",
      },
      {
        id: "a4",
        text: "Answer 4",
        description: "Description 4",
        isCorrect: true,
        questionId: "q2",
      },
    ],
  },
  {
    id: "q3",
    question: "Test Question 3",
    quizId: "quiz1",
    answers: [
      {
        id: "a5",
        text: "Answer 5",
        description: "Description 5",
        isCorrect: true,
        questionId: "q3",
      },
      {
        id: "a6",
        text: "Answer 6",
        description: "Description 6",
        isCorrect: false,
        questionId: "q3",
      },
    ],
  },
];

const mockMatch: Match = {
  id: "match1",
  createdAt: new Date(),
  quizId: "quiz1",
  status: "in_progress",
  player1Id: "player1",
  player2Id: "player2",
  player1Score: 0,
  player2Score: 0,
  currentTurnPlayer: "player1",
  roundNumber: 1,
  quiz: {
    id: "quiz1",
    title: "Test Quiz",
    description: "Test Description",
    views: 0,
    category: "test",
    creatorId: "creator1",
    createdAt: new Date(),
  },
  player1: {
    id: "player1",
    fullName: "Player 1",
    email: "player1@example.com",
    password: "password",
    createdAt: new Date(),
    xp: 0,
    lastActivityDate: new Date(),
  },
  player2: {
    id: "player2",
    fullName: "Player 2",
    email: "player2@example.com",
    password: "password",
    createdAt: new Date(),
    xp: 0,
    lastActivityDate: new Date(),
  },
};

describe("MultiplayerQuizCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation for getPlayerAnswers
    (multiplayerActions.getPlayerAnswers as jest.Mock).mockResolvedValue({
      answers: [],
      roundScore: 0,
    });
  });

  it("renders the initial question correctly", async () => {
    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    // Wait for initial data loading to complete
    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalledWith(
        mockMatch.id,
        mockMatch.roundNumber,
      );
    });

    expect(screen.getByText("Test Question 1")).toBeInTheDocument();
    expect(screen.getByText("Answer 1")).toBeInTheDocument();
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
    expect(screen.getByText("Question 0 of 3")).toBeInTheDocument();
    expect(screen.getByText("Round Score: 0")).toBeInTheDocument();
  });

  it("handles selecting a correct answer", async () => {
    (multiplayerActions.submitMultiplayerAnswer as jest.Mock).mockResolvedValue(
      {},
    );

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
    });

    // Click on correct answer
    fireEvent.click(screen.getByText("Answer 1"));

    await waitFor(() => {
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalledWith({
        matchId: mockMatch.id,
        questionId: "q1",
        answerId: "a1",
        isCorrect: true,
        roundNumber: mockMatch.roundNumber,
      });
    });

    // Check that score is updated
    expect(
      screen.getByText(`Round Score: ${XP_PER_CORRECT_ANSWER}`),
    ).toBeInTheDocument();

    // Check that answer feedback is shown
    expect(screen.getByText("Description 1")).toBeInTheDocument();

    // Next button should be enabled
    expect(screen.getByText("Next Question")).not.toBeDisabled();
  });

  it("handles selecting an incorrect answer", async () => {
    (multiplayerActions.submitMultiplayerAnswer as jest.Mock).mockResolvedValue(
      {},
    );

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
    });

    // Click on incorrect answer
    fireEvent.click(screen.getByText("Answer 2"));

    await waitFor(() => {
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalledWith({
        matchId: mockMatch.id,
        questionId: "q1",
        answerId: "a2",
        isCorrect: false,
        roundNumber: mockMatch.roundNumber,
      });
    });

    // Score should still be 0
    expect(screen.getByText("Round Score: 0")).toBeInTheDocument();

    // Check that answer description is shown
    expect(screen.getByText("Description 2")).toBeInTheDocument();

    // Next button should be enabled
    expect(screen.getByText("Next Question")).not.toBeDisabled();
  });

  it("navigates to the next question", async () => {
    (multiplayerActions.submitMultiplayerAnswer as jest.Mock).mockResolvedValue(
      {},
    );

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
    });

    // Answer the first question
    fireEvent.click(screen.getByText("Answer 1"));

    await waitFor(() => {
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalled();
    });

    // Go to next question
    fireEvent.click(screen.getByText("Next Question"));

    // Should show second question
    expect(screen.getByText("Test Question 2")).toBeInTheDocument();
    expect(screen.getByText("Answer 3")).toBeInTheDocument();
    expect(screen.getByText("Answer 4")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
  });

  it("shows round summary after all questions are answered", async () => {
    (multiplayerActions.submitMultiplayerAnswer as jest.Mock).mockResolvedValue(
      {},
    );

    // Mock QUESTIONS_PER_ROUND to 2 for this test
    jest.mock("@/constants/multiplayer", () => ({
      QUESTIONS_PER_ROUND: 2,
      XP_PER_CORRECT_ANSWER: 10,
    }));

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
    });

    // Answer first question (correct)
    fireEvent.click(screen.getByText("Answer 1"));
    await waitFor(() =>
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalled(),
    );
    fireEvent.click(screen.getByText("Next Question"));

    // Answer second question (correct)
    fireEvent.click(screen.getByText("Answer 4"));
    await waitFor(() => {
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalledTimes(
        2,
      );
    });

    // Go to summary
    fireEvent.click(screen.getByText("Next Question"));

    fireEvent.click(screen.getByText("Answer 6"));
    await waitFor(() => {
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalledTimes(
        3,
      );
    });

    fireEvent.click(screen.getByText("Show Round Summary"));

    // Check that summary is shown
    expect(screen.getByText("Round Summary")).toBeInTheDocument();
    expect(
      screen.getByText(
        `You scored ${XP_PER_CORRECT_ANSWER * 2} points this round!`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("End Your Turn")).toBeInTheDocument();
  });

  it("handles API error when submitting answer", async () => {
    (multiplayerActions.submitMultiplayerAnswer as jest.Mock).mockRejectedValue(
      new Error("API error"),
    );

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
    });

    // Click on correct answer
    fireEvent.click(screen.getByText("Answer 1"));

    await waitFor(() => {
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Failed to submit answer");
    });

    // Score should still be 0 (rollback)
    expect(screen.getByText("Round Score: 0")).toBeInTheDocument();
  });

  it("loads previous answers correctly", async () => {
    // Mock previous answers
    (multiplayerActions.getPlayerAnswers as jest.Mock).mockResolvedValue({
      answers: [
        {
          id: 1,
          matchId: mockMatch.id,
          playerId: mockMatch.player1Id,
          questionId: "q1",
          answerId: "a2",
          isCorrect: false,
        },
      ],
      roundScore: 0,
    });

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
      expect(screen.getByText("Description 2")).toBeInTheDocument();
    });

    // Next button should be enabled
    expect(screen.getByText("Next Question")).not.toBeDisabled();
  });

  it("submits end of turn when finishing round", async () => {
    (multiplayerActions.endPlayerTurn as jest.Mock).mockResolvedValue({});

    // Mock with all questions answered
    (multiplayerActions.getPlayerAnswers as jest.Mock).mockResolvedValue({
      answers: [
        { questionId: "q1", answerId: "a1", isCorrect: true },
        { questionId: "q2", answerId: "a4", isCorrect: true },
        { questionId: "q3", answerId: "a3", isCorrect: true },
      ],
      roundScore: XP_PER_CORRECT_ANSWER * 3,
    });

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
      fireEvent.click(screen.getByText("Show Round Summary"));
      expect(screen.getByText("Round Summary")).toBeInTheDocument();
    });

    // End turn
    fireEvent.click(screen.getByText("End Your Turn"));

    await waitFor(() => {
      expect(multiplayerActions.endPlayerTurn).toHaveBeenCalledWith(
        mockMatch.id,
        XP_PER_CORRECT_ANSWER * 3,
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Round completed. Waiting for opponent's turn.",
      );
    });
  });

  it("handles error when ending turn", async () => {
    (multiplayerActions.endPlayerTurn as jest.Mock).mockRejectedValue(
      new Error("API error"),
    );

    // Mock with all questions answered
    (multiplayerActions.getPlayerAnswers as jest.Mock).mockResolvedValue({
      answers: Array(QUESTIONS_PER_ROUND)
        .fill(0)
        .map((_, i) => ({
          questionId: `q${i + 1}`,
          answerId: `a${i * 2 + 1}`,
          isCorrect: true,
        })),
      roundScore: XP_PER_CORRECT_ANSWER * QUESTIONS_PER_ROUND,
    });

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
      fireEvent.click(screen.getByText("Show Round Summary"));
      expect(screen.getByText("Round Summary")).toBeInTheDocument();
    });

    // End turn
    fireEvent.click(screen.getByText("End Your Turn"));

    await waitFor(() => {
      expect(multiplayerActions.endPlayerTurn).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Failed to complete the round");
    });
  });

  it("calculates correct starting question index for player 1 on their turn", () => {
    const player1Match = {
      ...mockMatch,
      currentTurnPlayer: mockMatch.player1Id,
    };

    render(
      <MultiplayerQuizCard
        match={player1Match}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    // Should start with first question (index 0) - checked via displayed question text
    expect(screen.getByText("Test Question 1")).toBeInTheDocument();
  });

  it("calculates correct starting question index for player 2 on their turn", () => {
    const player2Match = {
      ...mockMatch,
      currentTurnPlayer: mockMatch.player2Id,
    };

    render(
      <MultiplayerQuizCard
        match={player2Match}
        questions={mockQuestions}
        playerNumber={2}
      />,
    );

    // Should start with first question (index 0) - checked via displayed question text
    expect(screen.getByText("Test Question 1")).toBeInTheDocument();
  });

  it("disables answer buttons after selection", async () => {
    (multiplayerActions.submitMultiplayerAnswer as jest.Mock).mockResolvedValue(
      {},
    );

    render(
      <MultiplayerQuizCard
        match={mockMatch}
        questions={mockQuestions}
        playerNumber={1}
      />,
    );

    await waitFor(() => {
      expect(multiplayerActions.getPlayerAnswers).toHaveBeenCalled();
    });

    // Click on an answer
    fireEvent.click(screen.getByText("Answer 1"));

    await waitFor(() => {
      expect(multiplayerActions.submitMultiplayerAnswer).toHaveBeenCalled();
    });

    // All answer buttons should be disabled
    const answerButtons = screen
      .getAllByRole("button")
      .filter(
        (button) =>
          button.textContent === "Answer 1" ||
          button.textContent === "Answer 2",
      );

    answerButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});

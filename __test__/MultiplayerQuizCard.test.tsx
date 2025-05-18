import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { toast } from "sonner";
import {
  QUESTIONS_PER_ROUND,
  XP_PER_CORRECT_ANSWER,
} from "@/constants/multiplayer";
import MultiplayerQuizCard from "../components/MultiplayerQuizCard";
import {
  endPlayerTurn,
  getPlayerAnswers,
  submitMultiplayerAnswer,
} from "@/lib/actions/multiplayer";

// Mock the modules
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/lib/actions/multiplayer", () => ({
  endPlayerTurn: jest.fn(),
  getPlayerAnswers: jest.fn(),
  submitMultiplayerAnswer: jest.fn(),
}));

// Mock constants for testing
jest.mock("@/constants/multiplayer", () => ({
  QUESTIONS_PER_ROUND: 5,
  XP_PER_CORRECT_ANSWER: 10,
}));

describe("MultiplayerQuizCard Integration Tests", () => {
  // Generate 10 test questions for a full game simulation
  const testQuestions = Array(10)
    .fill(0)
    .map((_, i) => ({
      id: `question-${i + 1}`,
      question: `Test Question ${i + 1}`,
      answers: [
        {
          id: `answer-${i * 3 + 1}`,
          text: "Wrong Answer",
          description: "Incorrect",
          isCorrect: false,
        },
        {
          id: `answer-${i * 3 + 2}`,
          text: "Correct Answer",
          description: "Correct",
          isCorrect: true,
        },
        {
          id: `answer-${i * 3 + 3}`,
          text: "Another Wrong Answer",
          description: "Incorrect",
          isCorrect: false,
        },
      ],
    }));

  const defaultProps = {
    match: {
      id: "match-1",
      player1Id: "player-1",
      player2Id: "player-2",
      currentTurnPlayer: "player-1",
      roundNumber: 1,
    },
    questions: testQuestions,
    playerNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for getPlayerAnswers
    (getPlayerAnswers as jest.Mock).mockResolvedValue({
      answers: [],
      roundScore: 0,
    });
    // Default mock implementation for submitMultiplayerAnswer
    (submitMultiplayerAnswer as jest.Mock).mockResolvedValue({ success: true });
  });

  it("simulates a complete player turn with alternating correct/incorrect answers", async () => {
    // @ts-ignore
    render(<MultiplayerQuizCard {...defaultProps} />);

    await waitFor(() => {
      expect(getPlayerAnswers).toHaveBeenCalled();
    });

    let expectedScore = 0;

    // Answer all questions in the round, alternating between correct and incorrect
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
      const isCorrect = i % 2 === 0; // Even indices will be correct answers

      if (isCorrect) {
        // Select correct answer
        const correctAnswer = screen.getByText("Correct Answer");
        fireEvent.click(correctAnswer);
        expectedScore += XP_PER_CORRECT_ANSWER;
      } else {
        // Select incorrect answer
        const incorrectAnswer = screen.getByText("Wrong Answer");
        fireEvent.click(incorrectAnswer);
      }

      await waitFor(() => {
        expect(submitMultiplayerAnswer).toHaveBeenCalledWith(
          expect.objectContaining({
            matchId: "match-1",
            questionId: `question-${i + 1}`,
            isCorrect: i % 2 === 0,
          }),
        );
      });

      if (i < QUESTIONS_PER_ROUND - 1) {
        // Go to next question if not the last one
        const nextButton = screen.getByText("Next Question");
        fireEvent.click(nextButton);
      }
    }

    // After answering all questions, should show round summary
    await waitFor(() => {
      expect(screen.getByText("Round Summary")).toBeInTheDocument();
      expect(
        screen.getByText(`You scored ${expectedScore} points this round!`),
      ).toBeInTheDocument();
    });

    // End the turn
    (endPlayerTurn as jest.Mock).mockResolvedValue({ success: true });
    const endTurnButton = screen.getByText("End Your Turn");
    fireEvent.click(endTurnButton);

    await waitFor(() => {
      expect(endPlayerTurn).toHaveBeenCalledWith("match-1", expectedScore);
      expect(toast.success).toHaveBeenCalledWith(
        "Round completed. Waiting for opponent's turn.",
      );
    });
  });

  it("handles race conditions when submitting multiple answers quickly", async () => {
    // Create controlled promises to simulate async operations
    let resolveFirst: Function;
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    let resolveSecond: Function;
    const secondPromise = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    // First call will be delayed, second call resolves immediately
    (submitMultiplayerAnswer as jest.Mock)
      .mockImplementationOnce(() => firstPromise)
      .mockImplementationOnce(() => secondPromise);

    render(<MultiplayerQuizCard {...defaultProps} />);

    await waitFor(() => {
      expect(getPlayerAnswers).toHaveBeenCalled();
    });

    // Click the first answer
    const firstAnswer = screen.getByText("Correct Answer");
    fireEvent.click(firstAnswer);

    // At this point, the component should be in a submitting state
    expect(firstAnswer).toBeDisabled();

    // Attempt to click another answer (this should be ignored due to isSubmitting state)
    const anotherAnswer = screen.getByText("Wrong Answer");
    fireEvent.click(anotherAnswer);

    // Only one submission should have been attempted
    expect(submitMultiplayerAnswer).toHaveBeenCalledTimes(1);

    // Resolve the first submission
    await act(async () => {
      resolveFirst!({ success: true });
    });

    // Now click next question
    const nextButton = screen.getByText("Next Question");
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);

    // Now we should be on question 2
    expect(screen.getByText("Test Question 2")).toBeInTheDocument();

    // Click an answer for question 2
    const question2Answer = screen.getByText("Wrong Answer");
    fireEvent.click(question2Answer);

    // Resolve the second submission
    await act(async () => {
      resolveSecond!({ success: true });
    });

    // Verify we have exactly 2 submissions
    expect(submitMultiplayerAnswer).toHaveBeenCalledTimes(2);
  });

  it("handles the case when some questions have already been answered", async () => {
    // Mock that 2 questions have already been answered
    (getPlayerAnswers as jest.Mock).mockResolvedValue({
      answers: [
        {
          questionId: "question-1",
          answerId: "answer-2",
          isCorrect: true,
        },
        {
          questionId: "question-2",
          answerId: "answer-4",
          isCorrect: false,
        },
      ],
      roundScore: XP_PER_CORRECT_ANSWER, // One correct answer
    });

    render(<MultiplayerQuizCard {...defaultProps} />);

    await waitFor(() => {
      // Check that we start at question 3 (index 2)
      expect(screen.getByText("Test Question 3")).toBeInTheDocument();
      // And that the round score is already 10
      expect(screen.getByText("Round Score: 10")).toBeInTheDocument();
      // And that we show answered count as 2
      expect(screen.getByText("Question 2 of 5")).toBeInTheDocument();
    });
  });

  it("handles multiple rounds correctly", async () => {
    // Test for round 2
    const round2Props = {
      ...defaultProps,
      match: {
        ...defaultProps.match,
        roundNumber: 2,
        currentTurnPlayer: "player-1", // Player 1's turn in round 2
      },
    };

    render(<MultiplayerQuizCard {...round2Props} />);

    await waitFor(() => {
      expect(getPlayerAnswers).toHaveBeenCalledWith("match-1", 2);
      // Should show the question at index 5 (first question of round 2)
      expect(screen.getByText("Test Question 6")).toBeInTheDocument();
    });
  });

  it("handles very long question text properly", async () => {
    const longQuestionProps = {
      ...defaultProps,
      questions: [
        {
          id: "question-long",
          question:
            "This is an extremely long question that exceeds 50 characters and should be displayed correctly without any truncation or layout issues. The component should handle this gracefully.",
          answers: [
            {
              id: "answer-long-1",
              text: "Answer 1",
              description: "Description 1",
              isCorrect: false,
            },
            {
              id: "answer-long-2",
              text: "Answer 2",
              description: "Description 2",
              isCorrect: true,
            },
            {
              id: "answer-long-3",
              text: "Answer 3",
              description: "Description 3",
              isCorrect: false,
            },
          ],
        },
        ...defaultProps.questions.slice(1),
      ],
    };

    render(<MultiplayerQuizCard {...longQuestionProps} />);

    await waitFor(() => {
      expect(getPlayerAnswers).toHaveBeenCalled();
    });

    // The long question should be rendered
    expect(
      screen.getByText(
        "This is an extremely long question that exceeds 50 characters and should be displayed correctly without any truncation or layout issues. The component should handle this gracefully.",
      ),
    ).toBeInTheDocument();
  });

  it("handles the scenario when all questions have been answered but not yet submitted", async () => {
    // Mock that all questions except the last one have been answered
    (getPlayerAnswers as jest.Mock).mockResolvedValue({
      answers: Array(QUESTIONS_PER_ROUND - 1)
        .fill(0)
        .map((_, i) => ({
          questionId: `question-${i + 1}`,
          answerId: `answer-${i * 3 + 2}`,
          isCorrect: true,
        })),
      roundScore: XP_PER_CORRECT_ANSWER * (QUESTIONS_PER_ROUND - 1),
    });

    render(<MultiplayerQuizCard {...defaultProps} />);

    await waitFor(() => {
      // Should be showing the last question
      expect(
        screen.getByText(`Test Question ${QUESTIONS_PER_ROUND}`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `Question ${QUESTIONS_PER_ROUND - 1} of ${QUESTIONS_PER_ROUND}`,
        ),
      ).toBeInTheDocument();
    });

    // Answer the last question
    const answer = screen.getByText("Correct Answer");
    fireEvent.click(answer);

    await waitFor(() => {
      // Now we should see the round summary
      expect(screen.getByText("Round Summary")).toBeInTheDocument();
      expect(
        screen.getByText(
          `You scored ${XP_PER_CORRECT_ANSWER * QUESTIONS_PER_ROUND} points this round!`,
        ),
      ).toBeInTheDocument();
    });
  });
});

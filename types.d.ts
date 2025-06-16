interface AuthCredentials {
  fullName: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  xp: number | null;
  lastActivityDate: Date;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  views: number;
  category: string;
  creatorId: string;
  createdAt: Date;
  users?: User;
}

interface QuizTypeCard {
  quizzes: Quiz;
  users: User | null;
}

interface Question {
  id: string;
  question: string;
  quizId: string;
  answers: {
    id: string;
    description: string;
    text: string;
    isCorrect: boolean;
    questionId: string;
  }[];
}

interface Answer {
  id: string;
  description: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
}

interface MatchmakingEntry {
  id: string;
  category: string;
  userId: string;
  joinedAt: Date;
  status: "waiting" | "matched" | "cancelled";
}

interface ongoingMatchEntry {
  id: string;
  createdAt: Date;
  quizId: string;
  quiz: Quiz;
  status: "waiting" | "cancelled" | "in_progress" | "completed";
  player1Id: string;
  player2Id: string;
  player1Score: number | null;
  player2Score: number | null;
  currentTurnPlayer: string;
  roundNumber: number | null;
  completedAt: Date | null;
}

interface Match {
  id: string;
  createdAt: Date;
  quizId: string;
  status: "waiting" | "cancelled" | "in_progress" | "completed";
  player1Id: string;
  player2Id: string;
  player1Score: number | null;
  player2Score: number | null;
  currentTurnPlayer: string;
  roundNumber: number | null;
  quiz: Quiz;
  player1: User;
  player2: User;
}

interface MultiplayerQuizProps {
  match: Match;
  questions: Question[];
  playerNumber: number;
}

interface MultiplayerAnswerParams {
  matchId: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  roundNumber: number;
}

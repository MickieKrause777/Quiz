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

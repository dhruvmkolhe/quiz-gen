export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string]; // exactly 4 options
  correctAnswer: OptionLetter;
  explanation: string;
  sourceSnippet: string; // The exact quote/passage from the PDF
}

export interface UserQuizState {
  selectedAnswers: Record<string, OptionLetter>; // questionId -> selected letter
  revealedAnswers: Record<string, boolean>; // questionId -> boolean
}

export interface QuizSettings {
  numQuestions: number;
  difficulty: DifficultyLevel;
}

export interface QuizGenerationResponse {
  questions: QuizQuestion[];
  requestedCount: number;
  validCount: number;
  notice?: string;
  pdfSummary?: {
    charCount: number;
    wordCount: number;
    titleSnippet?: string;
  };
}

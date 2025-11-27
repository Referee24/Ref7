
export enum QuestionType {
  THEORY = 'THEORY',
  VIDEO = 'VIDEO'
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string; // The text question or video scenario description
  videoPlaceholderUrl?: string; // URL for the video thumbnail/placeholder
  correctAnswer: boolean; // True for Yes, False for No
  explanation: string;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  wrongQuestions: Question[];
}

export type ViewState = 'HOME' | 'STUDY' | 'EXAM' | 'RESULTS';

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  prompt: string; // Used for AI generation context or topic definition
  isCustom?: boolean; // Identifies if the topic was added by the user
  userContent?: string; // The raw content provided by the user
  createdAt?: number;
}

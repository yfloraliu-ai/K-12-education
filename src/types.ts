export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type GenreId = "story" | "opinion" | "report" | "procedure" | "letter" | "poem";
export type Stage = "plan" | "draft" | "polish" | "shine";
export type CoachAction =
  | "chat"
  | "kickoff"
  | "word-lift"
  | "sentence-stretch"
  | "elaborate"
  | "feedback";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Project {
  id: string;
  grade: Grade;
  genre: GenreId;
  topic: string;
  plan: Record<string, string>;
  draft: string;
  stage: Stage;
  messages: ChatMessage[];
  /** Chat history is kept per stage so each step starts with a fresh kickoff. */
  kickedOff: Partial<Record<Stage, boolean>>;
  checked: Record<string, boolean>;
  createdAt: number;
  updatedAt: number;
}

export interface PlannerField {
  id: string;
  label: string;
  emoji: string;
  hint: string;
  /** Only show this box for grades >= minGrade (default 1). */
  minGrade?: Grade;
}

export interface GenreInfo {
  id: GenreId;
  name: string;
  emoji: string;
  tagline: string;
  minGrade: Grade;
  planner: PlannerField[];
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  minGrade?: Grade;
}

export interface LessonQuizItem {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  minGrade: Grade;
  maxGrade: Grade;
  bigIdea: string;
  points: string[];
  quiz: LessonQuizItem[];
}

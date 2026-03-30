// ============================================================
// Database Types
// ============================================================

export type RoomStatus = "waiting" | "playing" | "revealed";
export type QuestionStatus = "pending" | "yes" | "no" | "irrelevant";

export interface Room {
  id: string;
  room_code: string;
  story_title: string;
  story_content: string;
  true_need: string;
  is_active: boolean;
  reveal_triggered: boolean;
  buzz_triggered: boolean;
  buzz_team_name: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  room_id: string;
  team_name: string;
  score: number;
  created_at: string;
}

export interface Question {
  id: string;
  room_id: string;
  team_id: string | null;
  team_name: string;
  content: string;
  upvotes: number;
  status: QuestionStatus;
  created_at: string;
}

export interface UpvoteLog {
  id: string;
  question_id: string;
  team_id: string;
}

// ============================================================
// UI / Store Types
// ============================================================

export interface GameState {
  currentRoom: Room | null;
  currentTeam: Team | null;
  questions: Question[];
  teams: Team[];
  upvotedQuestionIds: Set<string>;
}

export interface TeacherState {
  pendingQuestions: Question[];
  yesQuestions: Question[];
  noQuestions: Question[];
  irrelevantQuestions: Question[];
}

// ============================================================
// Component Props
// ============================================================

export interface JudgeAction {
  questionId: string;
  status: QuestionStatus;
}

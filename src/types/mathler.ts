export type TileFeedbackColor = "green" | "yellow" | "gray";
export type MathlerGameStatus = "playing" | "won" | "lost";

export type AttemptItem = {
  value: string;
  color: TileFeedbackColor | null;
};

export type MathlerGameRecord = {
  puzzle: string[],
  id: string;
  status: MathlerGameStatus;
  startedAt: number;
  finishedAt: number;
  attemptsGrid: AttemptItem[][];
};

export type MathlerGameHistory = {
  history: MathlerGameRecord[];
};

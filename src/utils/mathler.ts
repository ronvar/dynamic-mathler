import {
  MathlerGameRecord,
  AttemptItem,
  TileFeedbackColor,
} from "@/types/mathler";
import { evaluate } from "mathjs";

/**
 * check if a token is a valid operator
 */
export const isOperator = (token: string) => /^[-+*/]$/.test(token);

/**
 * check if a token is a number (integer only)
 */
export const isNumber = (token: string) => /^\d+$/.test(token);

/**
 * extracts numbers and operators from an expression array
 */
function extractTokens(expr: string[]): {
  numbers: string[];
  operators: string[];
} {
  const numbers: string[] = [];
  const operators: string[] = [];

  for (const token of expr) {
    if (isOperator(token)) {
      operators.push(token);
    } else if (isNumber(token)) {
      numbers.push(token);
    }
  }

  return { numbers, operators };
}

/**
 * creates a frequency map (histogram) of tokens
 */
function tokenFrequency(tokens: string[]): Record<string, number> {
  return tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * verifies that every token in the puzzle exists in the guess
 * with the same or higher frequency (for supporting duplicates)
 */
function checkTokenCountsMatch(
  puzzleTokens: string[],
  attemptTokens: string[]
): boolean {
  const puzzleFreq = tokenFrequency(puzzleTokens);
  const attemptFreq = tokenFrequency(attemptTokens);

  for (const token in puzzleFreq) {
    if ((attemptFreq[token] || 0) < puzzleFreq[token]) {
      return false; // Not enough of this token in the attempt
    }
  }

  return true;
}

/**
 * Compares structure of the puzzle and the user's attempt.
 * The guess is valid if
 *  - it is complete (same length or longer than puzzle)
 *  - it evaluates to the same number
 *  - all numbers and operators in the puzzle are used with equal or greater frequency
 */
function compareEquationStructure(
  puzzle: string[],
  attempt: string[]
): boolean {
  try {
    if (attempt.length < puzzle.length) return false;

    const puzzleVal = evaluateEquationArray(puzzle);
    const attemptVal = evaluateEquationArray(attempt);

    if (puzzleVal !== attemptVal) return false;

    const { numbers: puzzleNums, operators: puzzleOps } = extractTokens(puzzle);
    const { numbers: attemptNums, operators: attemptOps } =
      extractTokens(attempt);

    const numsMatch = checkTokenCountsMatch(puzzleNums, attemptNums);
    const opsMatch = checkTokenCountsMatch(puzzleOps, attemptOps);

    return numsMatch && opsMatch;
  } catch (err) {
    return false;
  }
}

/**
 * Evaluates each tile in the user's current attempt.
 * - green: token is in the correct position (if the full guess is correct)
 * - yellow: token exists in the puzzle but is in the wrong position
 * - gray: token is not in the puzzle at all OR the guess is invalid/incomplete
 */
export const evaluateTileRow = (
  puzzle: string[],
  currentAttempt: AttemptItem[]
): AttemptItem[] => {
  const feedback: AttemptItem[] = [];

  // validate that the guess only includes numbers and operators
  const hasOnlyValidTokens = currentAttempt.every(
    (token) => isOperator(token.value) || isNumber(token.value)
  );

  if (!hasOnlyValidTokens) {
    return currentAttempt.map((token) => ({
      value: token.value,
      color: "gray",
    }));
  }

  const attemptValues = currentAttempt.map((t) => t.value);
  const isCorrect = compareEquationStructure(
    puzzle,
    attemptValues
  );

  for (let i = 0; i < currentAttempt.length; i++) {
    const token = currentAttempt[i];

    let color: TileFeedbackColor = "gray";

    if (isCorrect) {
      color = "green";
    } else if (puzzle.includes(token.value)) {
      color = "yellow";
    }

    feedback.push({ value: token.value, color });
  }

  return feedback;
};

export const evaluateEquationArray = (puzzle: string[]) => {
  const puzzleExpr = puzzle.join("");
  try {
    return evaluate(puzzleExpr);
  } catch (err) {
    return null;
  }
};

/**
 * Checks if the game was started today
 */
export const wasStartedToday = (game: MathlerGameRecord): boolean => {
  const currentDate = new Date();
  const gameDate = new Date(game.startedAt);

  return (
    currentDate.getDate() === gameDate.getDate() &&
    currentDate.getMonth() === gameDate.getMonth() &&
    currentDate.getFullYear() === gameDate.getFullYear()
  );
};

/**
 * Normalizes operators to their standard form.
 */
export const normalizeOperator = (token: string): string => {
  const map: Record<string, string> = {
    // Plus
    "＋": "+",
    "﹢": "+",
    "⁺": "+",
    // Minus
    "–": "-", // en dash
    "−": "-", // minus sign
    "—": "-", // em dash
    "﹣": "-",
    "‒": "-",
    // Multiplication
    "×": "*",
    "✕": "*",
    "✖": "*",
    "＊": "*",
    // Division
    "÷": "/",
    "∕": "/",
    "／": "/",
  };

  return map[token] || token;
};

/**
 *  Generates a wordle-like grid of emojis from the game record.
 */
export const getEmojiGridFromGame = (game: MathlerGameRecord) => {
  const colorToEmoji: Record<TileFeedbackColor, string> = {
    green: "🟩",
    yellow: "🟨",
    gray: "⬛",
  };

  return game.attemptsGrid
    .map((attempt) => {
      return attempt
        .map((tile) => {
          if (!tile.color) return "⬛";
          return colorToEmoji[tile.color];
        })
        .join("");
    })
    .join("\n");
};

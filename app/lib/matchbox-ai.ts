import { Board, serializeBoard, getValidMoves, serializeMove } from "./game-engine";
import { getStateEntry, StateEntry } from "./state-mapping";

export interface Bead {
  moveStr: string;
  color: string;
}

export interface Matchbox {
  boardState: string;
  beads: Bead[];
}

export interface MatchboxCollection {
  boxes: Record<string, Matchbox>;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface AIGameMove {
  boardState: string;
  moveStr: string;
  color: string;
}

const STORAGE_KEY = "matchbox-checkers-ai";
const HISTORY_KEY = "matchbox-checkers-history";

export function createMatchboxCollection(): MatchboxCollection {
  return {
    boxes: {},
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  };
}

/**
 * Gets or creates a matchbox for a given board state.
 * Uses the predefined state mappings for bead colors.
 */
function getOrCreateMatchbox(
  collection: MatchboxCollection,
  board: Board
): Matchbox {
  const boardState = serializeBoard(board);

  if (collection.boxes[boardState]) {
    return collection.boxes[boardState];
  }

  // Look up in state mapping
  const stateEntry = getStateEntry(boardState);

  let beads: Bead[];
  if (stateEntry) {
    // Use predefined beads from our mapping
    beads = stateEntry.moves.map((m) => ({
      moveStr: m.moveStr,
      color: m.color,
    }));
  } else {
    // Fallback: generate beads from valid moves with cycling colors
    const validMoves = getValidMoves(board, "black");
    const fallbackColors = ["#f97316", "#3b82f6", "#eab308", "#22c55e"];
    beads = validMoves.map((move, i) => ({
      moveStr: serializeMove(move),
      color: fallbackColors[i % fallbackColors.length],
    }));
  }

  const matchbox: Matchbox = { boardState, beads };
  collection.boxes[boardState] = matchbox;
  return matchbox;
}

/**
 * AI picks a random bead from the matchbox for the current board state.
 * Returns null if the matchbox is empty AND no valid moves exist (true resign).
 * If the matchbox is empty but moves exist, refill it (AI "re-learns" from scratch).
 */
export function aiPickMove(
  collection: MatchboxCollection,
  board: Board
): { move: AIGameMove; updatedCollection: MatchboxCollection } | null {
  const matchbox = getOrCreateMatchbox(collection, board);

  if (matchbox.beads.length === 0) {
    // Check if there are actually valid moves — if so, refill the matchbox
    const validMoves = getValidMoves(board, "black");
    if (validMoves.length === 0) {
      return null; // Truly no moves — AI loses by rules
    }

    // Refill: the AI has "forgotten" everything and tries fresh
    const stateEntry = getStateEntry(matchbox.boardState);
    if (stateEntry) {
      matchbox.beads = stateEntry.moves.map((m) => ({
        moveStr: m.moveStr,
        color: m.color,
      }));
    } else {
      const fallbackColors = ["#f97316", "#3b82f6", "#eab308", "#22c55e"];
      matchbox.beads = validMoves.map((move, i) => ({
        moveStr: serializeMove(move),
        color: fallbackColors[i % fallbackColors.length],
      }));
    }
  }

  // Pick random bead
  const randomIndex = Math.floor(Math.random() * matchbox.beads.length);
  const bead = matchbox.beads[randomIndex];

  const aiMove: AIGameMove = {
    boardState: matchbox.boardState,
    moveStr: bead.moveStr,
    color: bead.color,
  };

  return { move: aiMove, updatedCollection: collection };
}

/**
 * Remove the bead from the last move's matchbox (when computer loses).
 */
export function penalizeLastMove(
  collection: MatchboxCollection,
  gameMoves: AIGameMove[]
): MatchboxCollection {
  if (gameMoves.length === 0) return collection;

  const lastMove = gameMoves[gameMoves.length - 1];
  const matchbox = collection.boxes[lastMove.boardState];

  if (matchbox) {
    const beadIndex = matchbox.beads.findIndex(
      (b) => b.moveStr === lastMove.moveStr && b.color === lastMove.color
    );
    if (beadIndex !== -1) {
      matchbox.beads.splice(beadIndex, 1);
    }
  }

  collection.losses++;
  collection.gamesPlayed++;
  return collection;
}

/**
 * Remove a bead from the preceding move's matchbox (when AI resigns because empty).
 */
export function penalizePrecedingMove(
  collection: MatchboxCollection,
  gameMoves: AIGameMove[]
): MatchboxCollection {
  if (gameMoves.length < 2) {
    // If only 1 or 0 moves, penalize the last one if available
    return penalizeLastMove(collection, gameMoves);
  }

  const precedingMove = gameMoves[gameMoves.length - 2];
  const matchbox = collection.boxes[precedingMove.boardState];

  if (matchbox) {
    const beadIndex = matchbox.beads.findIndex(
      (b) =>
        b.moveStr === precedingMove.moveStr && b.color === precedingMove.color
    );
    if (beadIndex !== -1) {
      matchbox.beads.splice(beadIndex, 1);
    }
  }

  collection.losses++;
  collection.gamesPlayed++;
  return collection;
}

/**
 * Reward: double each bead used this game (add a duplicate) so the
 * computer is more likely to pick that winning move again.
 */
export function rewardMoves(
  collection: MatchboxCollection,
  gameMoves: AIGameMove[]
): MatchboxCollection {
  for (const aiMove of gameMoves) {
    const matchbox = collection.boxes[aiMove.boardState];
    if (matchbox) {
      // Add a duplicate bead with the same move and color
      matchbox.beads.push({ moveStr: aiMove.moveStr, color: aiMove.color });
    }
  }
  collection.wins++;
  collection.gamesPlayed++;
  return collection;
}

/**
 * Draw: beads stay unchanged.
 */
export function handleDraw(
  collection: MatchboxCollection
): MatchboxCollection {
  collection.draws++;
  collection.gamesPlayed++;
  return collection;
}

/**
 * Save collection to localStorage.
 */
export function saveCollection(collection: MatchboxCollection): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

/**
 * Load collection from localStorage.
 */
export function loadCollection(): MatchboxCollection | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as MatchboxCollection;
  } catch {
    return null;
  }
}

/**
 * Save game result to history.
 */
export function saveGameResult(result: "win" | "loss" | "draw"): void {
  if (typeof window === "undefined") return;
  const history = getGameHistory();
  history.push(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Get game history.
 */
export function getGameHistory(): ("win" | "loss" | "draw")[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Reset all AI data.
 */
export function resetAI(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem("matchbox-checkers-checkpoints");
}

/**
 * Get matchbox info for display — shows what the AI "knows" for a given state.
 */
export function getMatchboxForState(
  collection: MatchboxCollection,
  boardState: string
): Matchbox | null {
  return collection.boxes[boardState] || null;
}

/**
 * Get info about which state entry maps to an image.
 */
export function getStateEntryForDisplay(boardState: string): StateEntry | null {
  return getStateEntry(boardState);
}

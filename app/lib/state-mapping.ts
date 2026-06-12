import { serializeMove } from "./game-engine";

/**
 * Visual-to-Engine coordinate conversion:
 * VR0 = Engine Row 3, VR1 = Engine Row 2, VR2 = Engine Row 1, VR3 = Engine Row 0
 * Columns are the same.
 * 
 * Board serialization: "ROW3|ROW2|ROW1|ROW0"
 */

function visualToEngine(vr: number, c: number): { row: number; col: number } {
  return { row: 3 - vr, col: c };
}

/**
 * Each state entry contains:
 * - boardState: serialized board string
 * - chance: which move number for black (0-indexed)
 * - imageIndex: which image within that chance
 * - moves: array of {from, to} in engine coords with associated bead color
 */
export interface StateEntry {
  boardState: string;
  chance: number;
  imageIndex: number;
  moves: { moveStr: string; color: string }[];
}

const BEAD_BLUE = "#3b82f6";
const BEAD_YELLOW = "#eab308";
const BEAD_ORANGE = "#f97316";
const BEAD_GREEN = "#22c55e";

/**
 * Helper to build a board state string from piece positions.
 * Takes arrays of {row, col} in ENGINE coords for each player.
 */
function buildBoardState(
  whitePieces: { row: number; col: number }[],
  blackPieces: { row: number; col: number }[],
  whiteKings: { row: number; col: number }[] = [],
  blackKings: { row: number; col: number }[] = []
): string {
  // Initialize 4x4 grid with dots
  const grid: string[][] = Array.from({ length: 4 }, () =>
    Array(4).fill(".")
  );

  for (const p of whitePieces) grid[p.row][p.col] = "W";
  for (const p of blackPieces) grid[p.row][p.col] = "B";
  for (const p of whiteKings) grid[p.row][p.col] = "K";
  for (const p of blackKings) grid[p.row][p.col] = "Q";

  // Serialize: ROW3|ROW2|ROW1|ROW0
  const rows: string[] = [];
  for (let r = 3; r >= 0; r--) {
    rows.push(grid[r].join(""));
  }
  return rows.join("|");
}

function makeMove(fromVR: number, fromC: number, toVR: number, toC: number): string {
  const from = visualToEngine(fromVR, fromC);
  const to = visualToEngine(toVR, toC);
  return serializeMove({ from, to });
}

// ============================================================
// CHANCE 0 — Folder 2/ — Black's 1st Move
// ============================================================

// 2/state_1: White at VR1,C0 and VR0,C3. Black at VR3,C0 and VR3,C2.
const state_2_1: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 0), visualToEngine(0, 3)],
    [visualToEngine(3, 0), visualToEngine(3, 2)]
  ),
  chance: 0,
  imageIndex: 0,
  moves: [
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
    { moveStr: makeMove(3, 2, 2, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(3, 2, 2, 3), color: BEAD_ORANGE },
  ],
};

// 2/state_2: White at VR0,C3 and VR1,C2. Black at VR3,C0 and VR3,C2.
const state_2_2: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3), visualToEngine(1, 2)],
    [visualToEngine(3, 0), visualToEngine(3, 2)]
  ),
  chance: 0,
  imageIndex: 1,
  moves: [
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
    { moveStr: makeMove(3, 2, 2, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(3, 2, 2, 3), color: BEAD_ORANGE },
  ],
};

// 2/state_3: White at VR0,C1 and VR1,C2. Black at VR3,C0 and VR3,C2.
const state_2_3: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 1), visualToEngine(1, 2)],
    [visualToEngine(3, 0), visualToEngine(3, 2)]
  ),
  chance: 0,
  imageIndex: 2,
  moves: [
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
    { moveStr: makeMove(3, 2, 2, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(3, 2, 2, 3), color: BEAD_ORANGE },
  ],
};

// ============================================================
// CHANCE 1 — Folder 4/ — Black's 2nd Move
// ============================================================

// 4/state_1: White at VR0,C3. Black at VR3,C0. (One white captured)
const state_4_1: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3)],
    [visualToEngine(3, 0)]
  ),
  chance: 1,
  imageIndex: 0,
  moves: [
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 4/state_2: White at VR1,C0 and VR1,C2. Black at VR2,C1 and VR3,C0.
const state_4_2: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 0), visualToEngine(1, 2)],
    [visualToEngine(2, 1), visualToEngine(3, 0)]
  ),
  chance: 1,
  imageIndex: 1,
  moves: [
    { moveStr: makeMove(2, 1, 0, 3), color: BEAD_ORANGE },
  ],
};

// 4/state_3: White at VR1,C0 and VR1,C2. Black at VR2,C1 and VR3,C2.
const state_4_3: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 0), visualToEngine(1, 2)],
    [visualToEngine(2, 1), visualToEngine(3, 2)]
  ),
  chance: 1,
  imageIndex: 2,
  moves: [
    { moveStr: makeMove(2, 1, 0, 3), color: BEAD_BLUE },
    { moveStr: makeMove(3, 2, 2, 3), color: BEAD_ORANGE },
  ],
};

// 4/state_4: White at VR0,C3 and VR2,C3. Black at VR2,C1 and VR3,C2.
const state_4_4: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3), visualToEngine(2, 3)],
    [visualToEngine(2, 1), visualToEngine(3, 2)]
  ),
  chance: 1,
  imageIndex: 3,
  moves: [
    { moveStr: makeMove(2, 1, 1, 0), color: BEAD_GREEN },
    { moveStr: makeMove(2, 1, 1, 2), color: BEAD_BLUE },
  ],
};

// 4/state_5: White at VR0,C3 and VR2,C1. Black at VR2,C3 and VR3,C0.
const state_4_5: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3), visualToEngine(2, 1)],
    [visualToEngine(2, 3), visualToEngine(3, 0)]
  ),
  chance: 1,
  imageIndex: 4,
  moves: [
    { moveStr: makeMove(3, 0, 1, 2), color: BEAD_BLUE },
    { moveStr: makeMove(2, 3, 1, 2), color: BEAD_YELLOW },
  ],
};

// 4/state_6: White at VR0,C1 and VR2,C1. Black at VR2,C3 and VR3,C0.
const state_4_6: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 1), visualToEngine(2, 1)],
    [visualToEngine(2, 3), visualToEngine(3, 0)]
  ),
  chance: 1,
  imageIndex: 5,
  moves: [
    { moveStr: makeMove(3, 0, 1, 2), color: BEAD_BLUE },
    { moveStr: makeMove(2, 3, 1, 2), color: BEAD_YELLOW },
  ],
};

// 4/state_7: White at VR1,C0 and VR1,C2. Black at VR2,C3 and VR3,C0.
const state_4_7: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 0), visualToEngine(1, 2)],
    [visualToEngine(2, 3), visualToEngine(3, 0)]
  ),
  chance: 1,
  imageIndex: 6,
  moves: [
    { moveStr: makeMove(2, 3, 0, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 4/state_8: White at VR0,C3. Black at VR3,C2. (One white captured - ghost at VR3,C0)
const state_4_8: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3)],
    [visualToEngine(3, 2)]
  ),
  chance: 1,
  imageIndex: 7,
  moves: [
    { moveStr: makeMove(3, 2, 2, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(3, 2, 2, 3), color: BEAD_ORANGE },
  ],
};

// 4/state_9: White at VR0,C3 and VR2,C3. Black at VR2,C1 and VR3,C0.
const state_4_9: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3), visualToEngine(2, 3)],
    [visualToEngine(2, 1), visualToEngine(3, 0)]
  ),
  chance: 1,
  imageIndex: 8,
  moves: [
    { moveStr: makeMove(2, 1, 1, 0), color: BEAD_YELLOW },
    { moveStr: makeMove(2, 1, 1, 2), color: BEAD_ORANGE },
  ],
};

// 4/state_10: White at VR0,C1 and VR2,C3. Black at VR2,C1 and VR3,C0.
const state_4_10: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 1), visualToEngine(2, 3)],
    [visualToEngine(2, 1), visualToEngine(3, 0)]
  ),
  chance: 1,
  imageIndex: 9,
  moves: [
    { moveStr: makeMove(2, 1, 1, 0), color: BEAD_YELLOW },
    { moveStr: makeMove(2, 1, 1, 2), color: BEAD_ORANGE },
  ],
};

// ============================================================
// CHANCE 2 — Folder 6/ — Black's 3rd Move
// ============================================================

// 6/state_1: White at VR2,C1. Black at VR2,C3.
const state_6_1: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(2, 1)],
    [visualToEngine(2, 3)]
  ),
  chance: 2,
  imageIndex: 0,
  moves: [
    { moveStr: makeMove(2, 3, 1, 2), color: BEAD_YELLOW },
  ],
};

// 6/state_2: White at VR2,C1 and VR2,C3. Black at VR3,C0.
const state_6_2: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(2, 1), visualToEngine(2, 3)],
    [visualToEngine(3, 0)]
  ),
  chance: 2,
  imageIndex: 1,
  moves: [
    { moveStr: makeMove(3, 0, 1, 2), color: BEAD_BLUE },
  ],
};

// 6/state_3: White at VR0,C3. Black at VR1,C2 and VR3,C0.
const state_6_3: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3)],
    [visualToEngine(1, 2), visualToEngine(3, 0)]
  ),
  chance: 2,
  imageIndex: 2,
  moves: [
    { moveStr: makeMove(1, 2, 0, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 6/state_4: White at VR1,C2. Black at VR2,C3. (ghost at VR3,C2)
const state_6_4: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 2)],
    [visualToEngine(2, 3)]
  ),
  chance: 2,
  imageIndex: 3,
  moves: [
    { moveStr: makeMove(2, 3, 0, 1), color: BEAD_YELLOW },
  ],
};

// 6/state_5: White at VR1,C2 and VR2,C3. Black at VR1,C0 and VR3,C2.
const state_6_5: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 2), visualToEngine(2, 3)],
    [visualToEngine(1, 0), visualToEngine(3, 2)]
  ),
  chance: 2,
  imageIndex: 4,
  moves: [
    { moveStr: makeMove(1, 0, 0, 1), color: BEAD_BLUE },
    { moveStr: makeMove(3, 2, 2, 1), color: BEAD_YELLOW },
  ],
};

// 6/state_6: White at VR0,C3. Black at VR1,C0 and VR3,C0. (ghost at VR3,C2)
const state_6_6: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 3)],
    [visualToEngine(1, 0), visualToEngine(3, 0)]
  ),
  chance: 2,
  imageIndex: 5,
  moves: [
    { moveStr: makeMove(1, 0, 0, 1), color: BEAD_ORANGE },
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 6/state_7: White at VR1,C2 and VR2,C3. Black at VR1,C0 and VR3,C0.
const state_6_7: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 2), visualToEngine(2, 3)],
    [visualToEngine(1, 0), visualToEngine(3, 0)]
  ),
  chance: 2,
  imageIndex: 6,
  moves: [
    { moveStr: makeMove(1, 0, 0, 1), color: BEAD_ORANGE },
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 6/state_8: White at VR2,C1 and VR2,C3. Black at VR3,C2.
const state_6_8: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(2, 1), visualToEngine(2, 3)],
    [visualToEngine(3, 2)]
  ),
  chance: 2,
  imageIndex: 7,
  moves: [
    { moveStr: makeMove(3, 2, 1, 0), color: BEAD_YELLOW },
  ],
};

// 6/state_9: White at VR1,C0 and VR2,C3. Black at VR1,C2 and VR3,C0.
const state_6_9: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 0), visualToEngine(2, 3)],
    [visualToEngine(1, 2), visualToEngine(3, 0)]
  ),
  chance: 2,
  imageIndex: 8,
  moves: [
    { moveStr: makeMove(1, 2, 0, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(1, 2, 0, 3), color: BEAD_ORANGE },
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 6/state_10: White at VR0,C1. Black at VR1,C2 and VR3,C0. (ghost at VR3,C2)
const state_6_10: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 1)],
    [visualToEngine(1, 2), visualToEngine(3, 0)]
  ),
  chance: 2,
  imageIndex: 9,
  moves: [
    { moveStr: makeMove(1, 2, 0, 3), color: BEAD_ORANGE },
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 6/state_11: White at VR0,C1. Black at VR1,C0 and VR3,C0. (ghost at VR3,C2)
const state_6_11: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(0, 1)],
    [visualToEngine(1, 0), visualToEngine(3, 0)]
  ),
  chance: 2,
  imageIndex: 10,
  moves: [
    { moveStr: makeMove(3, 0, 2, 1), color: BEAD_BLUE },
  ],
};

// 6/state_12: White at VR1,C0. Black at VR2,C3. (ghost at VR3,C0)
const state_6_12: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 0)],
    [visualToEngine(2, 3)]
  ),
  chance: 2,
  imageIndex: 11,
  moves: [
    { moveStr: makeMove(2, 3, 1, 2), color: BEAD_YELLOW },
  ],
};

// ============================================================
// CHANCE 3 — Folder 8/ — Black's 4th Move
// ============================================================

// 8/state_1: Black at VR1,C2. (ghost at VR3,C2)
const state_8_1: StateEntry = {
  boardState: buildBoardState(
    [],
    [visualToEngine(1, 2)]
  ),
  chance: 3,
  imageIndex: 0,
  moves: [
    { moveStr: makeMove(1, 2, 0, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(1, 2, 0, 3), color: BEAD_ORANGE },
  ],
};

// 8/state_2: Black at VR1,C2. (ghost at VR3,C0)
const state_8_2: StateEntry = {
  boardState: buildBoardState(
    [],
    [visualToEngine(1, 2)]
  ),
  chance: 3,
  imageIndex: 1,
  moves: [
    { moveStr: makeMove(1, 2, 0, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(1, 2, 0, 3), color: BEAD_ORANGE },
  ],
};

// 8/state_3: White at VR1,C2. Black at VR1,C0 and VR2,C1. (ghost at VR3,C2)
const state_8_3: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 2)],
    [visualToEngine(1, 0), visualToEngine(2, 1)]
  ),
  chance: 3,
  imageIndex: 2,
  moves: [
    { moveStr: makeMove(1, 0, 0, 1), color: BEAD_BLUE },
    { moveStr: makeMove(2, 1, 0, 3), color: BEAD_ORANGE },
  ],
};

// 8/state_4: White at VR2,C3. Black at VR1,C0. (ghost at VR3,C0)
const state_8_4: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(2, 3)],
    [visualToEngine(1, 0)]
  ),
  chance: 3,
  imageIndex: 3,
  moves: [
    { moveStr: makeMove(1, 0, 0, 1), color: BEAD_BLUE },
  ],
};

// 8/state_5: White at VR1,C0. Black at VR1,C2 and VR2,C1. (ghost at VR3,C2)
const state_8_5: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(1, 0)],
    [visualToEngine(1, 2), visualToEngine(2, 1)]
  ),
  chance: 3,
  imageIndex: 4,
  moves: [
    { moveStr: makeMove(1, 2, 0, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(1, 2, 0, 3), color: BEAD_ORANGE },
  ],
};

// 8/state_6: White at VR2,C3. Black at VR1,C2. (ghost at VR3,C2)
const state_8_6: StateEntry = {
  boardState: buildBoardState(
    [visualToEngine(2, 3)],
    [visualToEngine(1, 2)]
  ),
  chance: 3,
  imageIndex: 5,
  moves: [
    { moveStr: makeMove(1, 2, 0, 1), color: BEAD_YELLOW },
    { moveStr: makeMove(1, 2, 0, 3), color: BEAD_ORANGE },
  ],
};

// 8/state_7: Black at VR1,C0. (ghost at VR3,C2)
const state_8_7: StateEntry = {
  boardState: buildBoardState(
    [],
    [visualToEngine(1, 0)]
  ),
  chance: 3,
  imageIndex: 6,
  moves: [
    { moveStr: makeMove(1, 0, 0, 1), color: BEAD_BLUE },
  ],
};

// ============================================================
// Export all states
// ============================================================

export const ALL_STATES: StateEntry[] = [
  // Chance 0
  state_2_1, state_2_2, state_2_3,
  // Chance 1
  state_4_1, state_4_2, state_4_3, state_4_4, state_4_5,
  state_4_6, state_4_7, state_4_8, state_4_9, state_4_10,
  // Chance 2
  state_6_1, state_6_2, state_6_3, state_6_4, state_6_5,
  state_6_6, state_6_7, state_6_8, state_6_9, state_6_10,
  state_6_11, state_6_12,
  // Chance 3
  state_8_1, state_8_2, state_8_3, state_8_4, state_8_5,
  state_8_6, state_8_7,
];

/**
 * Map: serialized board state → StateEntry
 * Note: states 8/state_1 and 8/state_2 have the same board state since ghosts aren't tracked.
 * We'll use the first match.
 */
export const STATE_MAP: Record<string, StateEntry> = {};
for (const state of ALL_STATES) {
  if (!STATE_MAP[state.boardState]) {
    STATE_MAP[state.boardState] = state;
  }
}

export function getStateEntry(boardState: string): StateEntry | null {
  return STATE_MAP[boardState] || null;
}

export function getImagePath(chance: number, imageIndex: number): string {
  const folder = (chance + 1) * 2; // chance 0 → folder 2, chance 1 → folder 4, etc.
  return `/assets/${folder}/state_${imageIndex + 1}.png`;
}

export function getStatesForChance(chance: number): StateEntry[] {
  return ALL_STATES.filter((s) => s.chance === chance);
}

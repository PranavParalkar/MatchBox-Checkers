# Matchbox Checkers - Technical Reference Document

A complete reference for building a Matchbox-based Machine Learning Checkers game on a 4x4 board, based on the architecture of the Matchbox Chess (Hexapawn) project.

---

## 1. Project Overview

### Concept
A 4x4 mini-checkers game where a matchbox AI learns to play through reinforcement learning. The human plays as White, the computer plays as Black. Each board state the computer encounters has a "matchbox" containing colored beads — each bead represents a possible move. The computer picks a random bead to decide its move. Over time, losing beads are removed and the computer improves.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: @dnd-kit/core
- **Animations**: framer-motion
- **State Persistence**: localStorage

### Key Dependencies
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/utilities": "^3.2.2",
  "framer-motion": "^12.40.0",
  "next": "16.2.7",
  "react": "19.2.4",
  "react-dom": "19.2.4"
}
```

---

## 2. Game Rules (4x4 Mini-Checkers)

### Board Setup
- 4x4 grid (alternating black/white squares)
- Pieces only occupy dark squares
- **White: 2 checkers** on the bottom dark squares
- **Black: 2 checkers** on the top dark squares

### Initial Position (engine representation)
```
Row 3: [ . , B , . , B ]    (top - Black/Computer home row)
Row 2: [ . , . , . , . ]    (empty)
Row 1: [ . , . , . , . ]    (empty)
Row 0: [ W , . , W , . ]    (bottom - White/Human home row)
```
*(Pieces on dark squares only. Exact layout depends on diagonal square pattern.)*

### Movement Rules
- Standard checkers diagonal movement: pieces move diagonally forward one square to an empty dark square
- **Captures**: Jump over an opponent's piece diagonally to an empty square beyond (captured piece is removed)
- **Kings**: When a piece reaches the opponent's back row, it becomes a King. Kings can move diagonally forward AND backward.
- **Mandatory captures**: If a capture is available, it MUST be taken
- **No multi-jumps**: Only single captures per turn (simplified for matchbox learning)
- White moves first

### Win Conditions
1. **Capture all opponent's pieces** — if all opponent's checkers are captured, you win
2. **Opponent has no legal moves** — if the opponent is blocked and cannot move, you win
3. **King promotion (asymmetric)** — if one player makes a King and the opponent does NOT also make a King on their very next move, the player who made the King wins

### Draw Condition
- **Simultaneous Kings**: If White makes a King, and then on Black's immediately following turn Black ALSO makes a King, the game is a **draw**
- This is the only draw condition

### Turn Order
- White (Human) always moves first
- Black (Computer/Matchbox) always moves second
- Turns alternate

### King Rules (Post-Promotion)
- A King is marked differently on the board (e.g., "WK" or "BK" in serialization)
- Kings can move and capture diagonally in ALL directions (forward and backward)
- The game ends immediately on the promotion turn if the draw/win condition triggers (see above)

---

## 3. Architecture

### File Structure
```
app/
├── components/
│   ├── GameBoard.tsx          # Main game UI + drag-drop board
│   ├── MatchboxPanel.tsx      # Right panel showing all matchbox states
│   ├── LandingScreen.tsx      # Start screen with logo
│   ├── InstructionPopup.tsx   # Initial 3-step tutorial
│   ├── CheckpointPopup.tsx    # Educational popups at game milestones
│   └── LearningCurvePopup.tsx # Win/Loss graph popup
├── lib/
│   ├── game-engine.ts         # Board logic, moves, win conditions
│   ├── matchbox-ai.ts         # AI bead logic, learning, save/load
│   ├── state-mapping.ts       # Maps board states to matchbox images
│   └── bead-definitions.ts    # Exact bead colors per matchbox image
├── globals.css                # Tailwind + cell styles
├── layout.tsx                 # Metadata, favicon
└── page.tsx                   # Phase routing (landing → instructions → game)
public/
├── logo.png                   # Game logo
├── welcome.png                # Instruction image (board setup)
├── winning_cnd.png            # Instruction image (win conditions)
└── assests/                   # Matchbox state images
    ├── 2/                     # Black's 1st move states
    ├── 4/                     # Black's 2nd move states
    └── 6/                     # Black's 3rd move states (and beyond)
```

---

## 4. Game Engine (`game-engine.ts`)

### Core Types
```typescript
export type Player = "white" | "black";
export type PieceType = "normal" | "king";
export type Cell = { player: Player; type: PieceType } | null;
export type Board = Cell[][];  // 4x4 grid

export interface Position {
  row: number;  // 0 = bottom (White home), 3 = top (Black home)
  col: number;  // 0 = left, 3 = right
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Position;  // Position of captured piece (if jump)
  promotesToKing?: boolean;  // Whether this move results in king promotion
}

export type GameResult = "white_wins" | "black_wins" | "draw" | null;

// Track if a king was just made (for draw detection)
export interface GameState {
  board: Board;
  lastKingMade: Player | null;  // Set when a player makes a king
}
```

### Key Functions
| Function | Purpose |
|----------|---------|
| `createInitialBoard()` | Returns the starting 4x4 board (2 White, 2 Black on dark squares) |
| `getValidMoves(board, player)` | Returns all legal moves (enforces mandatory captures). Kings can move backward. |
| `applyMove(board, move)` | Returns new board after move (removes captured pieces, promotes to King if reaching back row) |
| `checkGameResult(board, lastMoveBy, lastKingMade)` | Checks win/draw conditions including the King promotion rule |
| `serializeBoard(board)` | Converts board to string for matchbox lookup (uses W, B, K, Q for white/black normal/king) |
| `serializeMove(move)` | Converts move to string for bead storage |
| `deserializeMove(str)` | Converts string back to Move |
| `isKingPromotion(board, move, player)` | Checks if a move results in reaching the back row |

### Board Serialization Format
```
"ROW3|ROW2|ROW1|ROW0"
Each cell: "W" = White normal, "B" = Black normal, "K" = White King, "Q" = Black King, "." = empty
Example: ".B.B|....|....|W.W." 
```

### Win/Draw Detection Logic
```typescript
function checkGameResult(board, lastMoveBy, lastKingMade):
  // 1. Check if all opponent pieces captured
  if (no white pieces left) → "black_wins"
  if (no black pieces left) → "white_wins"

  // 2. Check King promotion win/draw
  if (a piece just became a King this turn):
    if (lastKingMade === opponent):
      // Opponent made a king last turn, we just made one too → DRAW
      return "draw"
    else:
      // We just made a king, opponent gets one more turn to also make a king
      // Don't declare winner yet — set lastKingMade = currentPlayer
      // On the NEXT turn's check: if opponent did NOT make a king → current player wins
      
  if (lastKingMade !== null AND lastMoveBy !== lastKingMade):
    // The player who made a king was lastKingMade
    // The other player just moved and did NOT make a king → king-maker wins
    return lastKingMade === "white" ? "white_wins" : "black_wins"

  // 3. Check if next player has no legal moves
  if (nextPlayer has no moves) → lastMoveBy wins

  return null  // game continues
```

### Move Generation Logic
```typescript
// Normal pieces move diagonally forward only
// Kings move diagonally in ALL directions (forward + backward)
// White forward = toward row 3, Black forward = toward row 0

// For each piece of the current player:
//   Determine directions based on piece type (normal vs king)
//   1. Check diagonal squares in valid directions for simple moves (if empty)
//   2. Check for jumps: opponent on diagonal AND empty square beyond

// MANDATORY CAPTURES: If ANY capture exists for ANY piece, return ONLY captures
```

---

## 5. Matchbox AI (`matchbox-ai.ts`)

### Data Structures
```typescript
export interface Bead {
  moveStr: string;   // Serialized move
  color: string;     // Display color (matches professor's images)
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
}

export interface AIGameMove {
  boardState: string;
  moveStr: string;
  color: string;
}
```

### Reinforcement Learning Rules

| Outcome | Action | Effect |
|---------|--------|--------|
| **Computer Wins** | Reward | All beads stay (preserve state) |
| **Computer Loses** | Punish | Remove 1 bead from the LAST move's matchbox |
| **Draw** | Neutral | All beads stay (no punishment, no reward) |
| **Computer Resigns** (empty matchbox) | Punish preceding | Remove 1 bead from the PRECEDING move's matchbox |

### Key Functions
| Function | Purpose |
|----------|---------|
| `createMatchboxCollection()` | Fresh empty collection |
| `aiPickMove(collection, board)` | Pick random bead from matchbox; returns null if empty (resign) |
| `penalizeLastMove(collection, gameMoves)` | Remove last move's bead on loss |
| `penalizePrecedingMove(collection, gameMoves)` | Remove preceding bead on resign |
| `rewardMoves(collection, gameMoves)` | Just increment win counter (beads stay) |
| `saveCollection(collection)` | Save to localStorage |
| `loadCollection()` | Load from localStorage |

### Matchbox Creation
When a board state is first encountered:
1. Look up the state in `state-mapping.ts` to find its image
2. Get the professor's bead colors from `bead-definitions.ts`
3. Generate valid moves for Black
4. Create beads: one per move, using professor's colors (truncate to professor's count if more moves exist due to mirror non-reduction)

### Bead Color Palette
```typescript
const BEAD_COLORS = [
  "#f97316",  // orange
  "#3b82f6",  // blue
  "#eab308",  // yellow
  "#22c55e",  // green
];
```

---

## 6. State Mapping (`state-mapping.ts`)

### Purpose
Maps each possible serialized board state to a specific matchbox image file. Since images may represent mirror-reduced states, multiple engine states can map to the same image.

### Structure
```typescript
export const STATE_TO_IMAGE: Record<string, { chance: number; imageIndex: number }> = {
  "SERIALIZED_STATE": { chance: 0, imageIndex: 0 },
  // ... all states
};
```

### Image-to-States Reverse Mapping
```typescript
export function getStatesForImage(chance: number, imageIndex: number): string[]
```
Used to look up beads in the collection for display.

### Chance Sections
- **Chance 0**: Black's 1st move (after White's opening)
- **Chance 1**: Black's 2nd move
- **Chance 2**: Black's 3rd move
- **Chance N**: Black's (N+1)th move

For 4x4 checkers, games can last longer than hexapawn, so there may be more chance sections.

---

## 7. Bead Definitions (`bead-definitions.ts`)

### Purpose
Hardcodes the exact bead colors for each matchbox image, matching the professor's arrow colors.

### Structure
```typescript
export const IMAGE_BEAD_DISPLAY: Record<string, string[]> = {
  "0-0": [BEAD_ORANGE, BEAD_BLUE],          // Chance 0, Image 1
  "0-1": [BEAD_YELLOW, BEAD_BLUE, BEAD_ORANGE], // Chance 0, Image 2
  "1-0": [BEAD_BLUE, BEAD_ORANGE, BEAD_YELLOW], // Chance 1, Image 1
  // ...
};

export function getInitialBeadsForImage(chance: number, imageIndex: number): string[]
```

---

## 8. UI/UX Design

### Layout (Game Screen)
```
┌─────────────────────────────────────────────────────┐
│  [Logo] Matchbox Checkers                           │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   4x4 BOARD  │   COMPUTER RULES (MATCHBOXES)        │
│   (drag/drop)│                                      │
│              │   [2nd Chance] [images + beads]       │
│  Direction   │   [4th Chance] [images + beads]       │
│  labels      │   [6th Chance] [images + beads]       │
│              │   ...                                │
│  Status msg  │                                      │
│              │                                      │
│  Score       │                                      │
│  ♙: 0  ♟: 0 │                                      │
│              │   Legend:                             │
│  [New Game]  │   🟢 Current  🟡 Used  Win/Loss     │
│  [Reset AI]  │                                      │
│  [Learning]  │                                      │
│              │                                      │
│  Games: 0    │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Theme: White & Black
- Background: `linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)`
- Text: `#1a1a1a` (primary), `#555555` (secondary), `#777777` (muted)
- Board cells: `.cell-light { background: #f0f0f0 }`, `.cell-dark { background: #1a1a1a }`
- Pieces: White = `#ffffff` with dark border, Black = `#1a1a1a` with white border
- Buttons: Black bg/white text or inverse

### Board Display
- Board rendered FLIPPED: engine Row 0 (White home) at TOP, Row 3 (Black home) at BOTTOM
- This matches the matchbox images which show White at top, Black at bottom
- Cell size: `w-20 h-20 sm:w-24 sm:h-24` (slightly smaller than 3x3 since 4x4)

### Matchbox Panel (Right Side)
- Shows ALL matchbox state images organized by "chance" (Black's move number)
- Grid: `grid-cols-4 sm:grid-cols-5 lg:grid-cols-6`
- Each card: image + colored beads below
- **Highlighting**: Green border + glow on active state, amber on used states this game
- **Bead removal**: Removed beads shown as dashed outlines
- Auto-scrolls to the highlighted image

### Drag & Drop
- Uses `@dnd-kit/core` with PointerSensor and TouchSensor
- Valid move targets shown with green ring
- Last AI move shown with amber ring

### Popups & Flow
1. **Landing Screen**: Dark background, logo, "Start Playing" button
2. **Instructions** (3 steps): Welcome + image, Rules + image, Win conditions + image
3. **Game**: Full board + matchbox panel
4. **Checkpoint Popups**: Appear at games 3, 6, 10 explaining the AI
5. **Learning Curve**: Accessible anytime, shows cumulative win/loss graph (SVG)

---

## 9. State Management

### React State (GameBoard)
```typescript
board: Board                    // Current 4x4 board (cells include piece type)
validMoves: Move[]              // Currently highlighted valid moves
currentTurn: "white" | "black"  // Whose turn
gameResult: GameResult          // null | "white_wins" | "black_wins" | "draw"
lastKingMade: Player | null     // Tracks if a king was made (for draw detection)
collection: MatchboxCollection  // The AI's brain
aiGameMoves: AIGameMove[]       // Moves AI made this game
isAiThinking: boolean           // Animation state
lastAiMove: { move, color }     // For highlighting
scores: { human, computer, draws }  // Win/draw counts
message: string                 // Status text
aiThinkingPhase: string | null  // "picking" | "moving" | null
aiSelectedBead: string | null   // Color of bead being used
lastRemovedBead: string | null  // Color of bead that was removed
activeCheckpoint: object | null // Currently showing checkpoint
showLearningCurve: boolean      // Learning curve popup visible
```

### localStorage Keys
| Key | Purpose |
|-----|---------|
| `matchbox-checkers-ai` | Serialized MatchboxCollection |
| `matchbox-checkers-history` | Array of "win"/"loss" strings |
| `matchbox-checkers-checkpoints` | Set of shown checkpoint game counts |

---

## 10. Game Flow

### Turn Sequence
1. Human drags White piece to valid square
2. Board updates:
   - If capture: remove opponent piece
   - If reaching back row: promote to King
3. Check for game result:
   - All opponent pieces captured? → Human wins
   - King just made? → Set `lastKingMade = "white"`, check if opponent made king last turn (draw)
   - If `lastKingMade === "black"` (opponent made king last turn) and White did NOT make king → Black wins
4. If no result, AI's turn starts (900ms delay)
5. AI looks up current board state in matchbox collection
6. If matchbox empty → AI resigns, penalize preceding move
7. Otherwise picks random bead → gets move + color
8. After 700ms animation delay, applies move:
   - If capture: remove opponent piece
   - If reaching back row: promote to King
9. Check for game result:
   - All opponent pieces captured? → Computer wins
   - King just made? → Set `lastKingMade = "black"`, check if human made king last turn (draw)
   - If `lastKingMade === "white"` and Black did NOT make king → White wins
   - Next player (White) has no legal moves? → Computer wins
10. If no result, Human's turn resumes

### Learning Flow (on game end)
1. If **computer lost**: `penalizeLastMove()` — removes 1 bead from the matchbox used for the AI's final move
2. If **computer won**: `rewardMoves()` — beads stay unchanged (just increment counter)
3. If **draw**: `handleDraw()` — beads stay unchanged (no punishment, increment games played)
4. If **computer resigned**: `penalizePrecedingMove()` — removes bead from the move before resignation
5. Save collection to localStorage
6. Save result to history ("win", "loss", or "draw")
7. Check for checkpoint popup triggers

---

## 11. Differences from Hexapawn (3x3)

| Aspect | Hexapawn (3x3) | Mini-Checkers (4x4) |
|--------|----------------|---------------------|
| Board size | 3x3 | 4x4 (dark squares only) |
| Pieces per side | 3 pawns | 2 checkers |
| Movement | Forward + diagonal capture | Diagonal forward only |
| Capture mechanic | Move into opponent's square | Jump over opponent to empty beyond |
| Mandatory capture | No | Yes |
| Kings | No | Yes (reach back row) |
| King movement | N/A | Diagonal in ALL directions |
| Win: reach back row | Yes (immediate win) | Makes a King; opponent gets 1 turn to also King |
| Draw possible | No | Yes (both make Kings within 1 turn) |
| Max game length | 6 moves | Longer (more states, Kings can extend) |
| Total states | 24 (mirror-reduced) | More (need to enumerate) |
| Piece types in serialization | W, B, . | W, B, K (White King), Q (Black King), . |

---

## 12. Development Steps

1. **Set up project** — Clone/scaffold Next.js with same dependencies
2. **Implement game engine** — 4x4 board, checker moves, captures, win conditions
3. **Enumerate all states** — Run script to find all reachable board states per chance
4. **Create matchbox images** — Draw each state with colored arrows for moves
5. **Build state mapping** — Map serialized states to image files
6. **Define bead colors** — Hardcode colors per image matching arrows
7. **Implement matchbox AI** — Same logic as hexapawn (pick, penalize, reward)
8. **Build UI** — Board, drag-drop, matchbox panel, popups
9. **Add learning curve** — SVG graph of cumulative win/loss
10. **Test & tune** — Play 30+ games, verify AI learns

---

## 13. Key Implementation Notes

- **Board flip**: Display renders rows in reverse order so White (human) is at top visually
- **Mirror states**: Some board states are left-right mirrors. The professor may include both as separate matchboxes or collapse them. Handle both in `STATE_TO_IMAGE`
- **Bead count limit**: When professor defines N beads for a state, only create N beads in the engine (even if more moves exist due to non-mirror-reduction)
- **Color consistency**: Engine must use the same bead colors as defined in `bead-definitions.ts`. The panel display falls back to professor's colors for unencountered states
- **Mandatory captures**: `getValidMoves` must filter: if any capture exists, return ONLY captures
- **localStorage conflict**: Use different keys than the hexapawn game (`matchbox-checkers-*` vs `matchbox-chess-*`)

---

## 14. Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname),
  },
};

export default nextConfig;
```

This resolves the Vercel deployment Turbopack root issue.

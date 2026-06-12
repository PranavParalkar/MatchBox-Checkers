export type Player = "white" | "black";
export type PieceType = "normal" | "king";
export type Cell = { player: Player; type: PieceType } | null;
export type Board = Cell[][]; // 4x4 grid

export interface Position {
  row: number; // 0 = bottom (White home), 3 = top (Black home)
  col: number; // 0 = left, 3 = right
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Position;
  promotesToKing?: boolean;
}

export type GameResult = "white_wins" | "black_wins" | "draw" | null;

export interface GameState {
  board: Board;
  lastKingMade: Player | null;
}

/**
 * Dark (playable) squares on the 4x4 board.
 * Using the convention where (row + col) % 2 === 1 are dark squares.
 * 
 * Engine grid:
 *   Row 3 (Black home): cols 1, 3
 *   Row 2:              cols 0, 2
 *   Row 1:              cols 1, 3
 *   Row 0 (White home): cols 0, 2
 */
export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: 4 }, () => Array(4).fill(null));

  // White home row (engine row 3, VR0 top): dark squares at col 1, col 3
  board[3][1] = { player: "white", type: "normal" };
  board[3][3] = { player: "white", type: "normal" };

  // Black home row (engine row 0, VR3 bottom): dark squares at col 0, col 2
  board[0][0] = { player: "black", type: "normal" };
  board[0][2] = { player: "black", type: "normal" };

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function getValidMoves(board: Board, player: Player): Move[] {
  const simpleMoves: Move[] = [];
  const captureMoves: Move[] = [];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = board[row][col];
      if (!cell || cell.player !== player) continue;

      const directions = getMoveDirections(cell, player);

      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        // Simple move
        if (isInBounds(newRow, newCol) && board[newRow][newCol] === null) {
          const promotesToKing = isKingPromotion(player, newRow);
          simpleMoves.push({
            from: { row, col },
            to: { row: newRow, col: newCol },
            promotesToKing,
          });
        }

        // Capture move
        if (isInBounds(newRow, newCol) && board[newRow][newCol] !== null) {
          const midCell = board[newRow][newCol]!;
          if (midCell.player !== player) {
            const jumpRow = row + dr * 2;
            const jumpCol = col + dc * 2;
            if (
              isInBounds(jumpRow, jumpCol) &&
              board[jumpRow][jumpCol] === null
            ) {
              const promotesToKing = isKingPromotion(player, jumpRow);
              captureMoves.push({
                from: { row, col },
                to: { row: jumpRow, col: jumpCol },
                captured: { row: newRow, col: newCol },
                promotesToKing,
              });
            }
          }
        }
      }
    }
  }

  // Mandatory captures
  if (captureMoves.length > 0) return captureMoves;
  return simpleMoves;
}

function getMoveDirections(
  cell: { player: Player; type: PieceType },
  player: Player
): number[][] {
  // White starts at row 3, moves toward row 0 (forward = -1)
  // Black starts at row 0, moves toward row 3 (forward = +1)
  const forwardDir = player === "white" ? -1 : 1;

  if (cell.type === "king") {
    return [
      [1, -1],
      [1, 1],
      [-1, -1],
      [-1, 1],
    ];
  }

  return [
    [forwardDir, -1],
    [forwardDir, 1],
  ];
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 4 && col >= 0 && col < 4;
}

function isKingPromotion(player: Player, destRow: number): boolean {
  // White promotes at row 0 (Black's home), Black promotes at row 3 (White's home)
  if (player === "white" && destRow === 0) return true;
  if (player === "black" && destRow === 3) return true;
  return false;
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const piece = newBoard[move.from.row][move.from.col]!;

  // Move piece
  newBoard[move.to.row][move.to.col] = { ...piece };
  newBoard[move.from.row][move.from.col] = null;

  // Remove captured piece
  if (move.captured) {
    newBoard[move.captured.row][move.captured.col] = null;
  }

  // Promote to king
  if (move.promotesToKing) {
    newBoard[move.to.row][move.to.col]!.type = "king";
  }

  return newBoard;
}

export function checkGameResult(
  board: Board,
  lastMoveBy: Player,
  lastKingMade: Player | null,
  justMadeKing: boolean
): { result: GameResult; newLastKingMade: Player | null } {
  const whitePieces = countPieces(board, "white");
  const blackPieces = countPieces(board, "black");

  // 1. All opponent pieces captured
  if (whitePieces === 0) return { result: "black_wins", newLastKingMade: lastKingMade };
  if (blackPieces === 0) return { result: "white_wins", newLastKingMade: lastKingMade };

  // 2. King promotion win/draw
  if (justMadeKing) {
    if (lastKingMade !== null && lastKingMade !== lastMoveBy) {
      // Opponent made a king last turn, we just made one too → DRAW
      return { result: "draw", newLastKingMade: lastMoveBy };
    }
    // We just made a king, mark it for the next turn
    return { result: null, newLastKingMade: lastMoveBy };
  }

  if (lastKingMade !== null && lastMoveBy !== lastKingMade) {
    // The player who made a king was lastKingMade.
    // The other player just moved and did NOT make a king → king-maker wins
    const winner = lastKingMade === "white" ? "white_wins" : "black_wins";
    return { result: winner as GameResult, newLastKingMade: lastKingMade };
  }

  // 3. Next player has no legal moves
  const nextPlayer = lastMoveBy === "white" ? "black" : "white";
  const nextMoves = getValidMoves(board, nextPlayer);
  if (nextMoves.length === 0) {
    const winner = lastMoveBy === "white" ? "white_wins" : "black_wins";
    return { result: winner as GameResult, newLastKingMade: lastKingMade };
  }

  return { result: null, newLastKingMade: lastKingMade };
}

function countPieces(board: Board, player: Player): number {
  let count = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col]?.player === player) count++;
    }
  }
  return count;
}

/**
 * Board serialization format: "ROW3|ROW2|ROW1|ROW0"
 * Each cell: W = White normal, B = Black normal, K = White King, Q = Black King, . = empty
 */
export function serializeBoard(board: Board): string {
  const rows: string[] = [];
  for (let r = 3; r >= 0; r--) {
    let rowStr = "";
    for (let c = 0; c < 4; c++) {
      const cell = board[r][c];
      if (!cell) {
        rowStr += ".";
      } else if (cell.player === "white" && cell.type === "normal") {
        rowStr += "W";
      } else if (cell.player === "white" && cell.type === "king") {
        rowStr += "K";
      } else if (cell.player === "black" && cell.type === "normal") {
        rowStr += "B";
      } else {
        rowStr += "Q";
      }
    }
    rows.push(rowStr);
  }
  return rows.join("|");
}

export function serializeMove(move: Move): string {
  return `${move.from.row},${move.from.col}-${move.to.row},${move.to.col}`;
}

export function deserializeMove(str: string): Move {
  const [fromStr, toStr] = str.split("-");
  const [fr, fc] = fromStr.split(",").map(Number);
  const [tr, tc] = toStr.split(",").map(Number);

  const move: Move = {
    from: { row: fr, col: fc },
    to: { row: tr, col: tc },
  };

  // Detect if it's a capture (distance of 2 in both row and col)
  if (Math.abs(tr - fr) === 2 && Math.abs(tc - fc) === 2) {
    move.captured = {
      row: (fr + tr) / 2,
      col: (fc + tc) / 2,
    };
  }

  return move;
}

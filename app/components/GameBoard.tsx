"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  Board,
  Move,
  GameResult,
  Player,
  createInitialBoard,
  getValidMoves,
  applyMove,
  checkGameResult,
  serializeBoard,
  serializeMove,
  deserializeMove,
  isDarkSquare,
} from "../lib/game-engine";
import {
  MatchboxCollection,
  AIGameMove,
  aiPickMove,
  penalizeLastMove,
  penalizePrecedingMove,
  rewardMoves,
  handleDraw,
  saveCollection,
  loadCollection,
  createMatchboxCollection,
  saveGameResult,
  resetAI,
} from "../lib/matchbox-ai";
import { ALL_STATES, getImagePath, getStatesForChance } from "../lib/state-mapping";
import { getInitialBeadsForImage } from "../lib/bead-definitions";
import MatchboxPanel from "./MatchboxPanel";
import CheckpointPopup from "./CheckpointPopup";
import LearningCurvePopup from "./LearningCurvePopup";
import DraggablePiece from "./DraggablePiece";
import DroppableCell from "./DroppableCell";

export default function GameBoard() {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentTurn, setCurrentTurn] = useState<Player>("white");
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [lastKingMade, setLastKingMade] = useState<Player | null>(null);
  const [collection, setCollection] = useState<MatchboxCollection>(
    createMatchboxCollection
  );
  const [aiGameMoves, setAiGameMoves] = useState<AIGameMove[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastAiMove, setLastAiMove] = useState<{
    from: { row: number; col: number };
    to: { row: number; col: number };
    color: string;
  } | null>(null);
  const [scores, setScores] = useState({ human: 0, computer: 0, draws: 0 });
  const [message, setMessage] = useState("Your turn! Drag a white piece.");
  const [aiThinkingPhase, setAiThinkingPhase] = useState<string | null>(null);
  const [aiSelectedBead, setAiSelectedBead] = useState<string | null>(null);
  const [lastRemovedBead, setLastRemovedBead] = useState<string | null>(null);
  const [activeCheckpoint, setActiveCheckpoint] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [showLearningCurve, setShowLearningCurve] = useState(false);
  const [activeBoardState, setActiveBoardState] = useState<string | null>(null);
  const [activeBeadColor, setActiveBeadColor] = useState<string | null>(null);
  const [highlightedMoves, setHighlightedMoves] = useState<Move[]>([]);

  const gamesPlayedRef = useRef(0);

  // Load saved data
  useEffect(() => {
    const saved = loadCollection();
    if (saved) {
      setCollection(saved);
      setScores({
        human: saved.losses,
        computer: saved.wins,
        draws: saved.draws,
      });
      // Restore encountered chances from saved matchbox states
      gamesPlayedRef.current = saved.gamesPlayed;
    }
  }, []);

  // Compute valid moves when turn changes
  useEffect(() => {
    if (currentTurn === "white" && !gameResult) {
      const moves = getValidMoves(board, "white");
      setValidMoves(moves);
      if (moves.length === 0) {
        endGame("black_wins");
      }
    }
  }, [board, currentTurn, gameResult]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const endGame = useCallback(
    (result: GameResult) => {
      setGameResult(result);
      let updatedCollection = { ...collection };

      if (result === "white_wins") {
        // Human wins = computer loses
        if (aiGameMoves.length > 0) {
          updatedCollection = penalizeLastMove(updatedCollection, aiGameMoves);
          const removedMove = aiGameMoves[aiGameMoves.length - 1];
          setLastRemovedBead(removedMove.color);
          setActiveBeadColor(null);
          // Highlight the matchbox that was penalized
          setActiveBoardState(removedMove.boardState);
        } else {
          updatedCollection.losses++;
          updatedCollection.gamesPlayed++;
        }
        setScores((s) => ({ ...s, human: s.human + 1 }));
        setMessage("You win! The computer lost a bead.");
        saveGameResult("win");
      } else if (result === "black_wins") {
        updatedCollection = rewardMoves(updatedCollection, aiGameMoves);
        setScores((s) => ({ ...s, computer: s.computer + 1 }));
        setMessage("Computer wins! Its winning beads are doubled.");
        saveGameResult("loss");
        // activeBeadColor stays set from doAiTurn — shows the winning bead
      } else if (result === "draw") {
        updatedCollection = handleDraw(updatedCollection);
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
        setMessage("Draw! Both sides made Kings.");
        saveGameResult("draw");
        // Keep the last AI bead highlighted
      }

      setCollection(updatedCollection);
      saveCollection(updatedCollection);
      gamesPlayedRef.current = updatedCollection.gamesPlayed;

      // Check for checkpoint popups
      checkCheckpoints(updatedCollection.gamesPlayed);
    },
    [collection, aiGameMoves]
  );

  const aiResign = useCallback(() => {
    setGameResult("white_wins");
    let updatedCollection = { ...collection };

    if (aiGameMoves.length > 0) {
      updatedCollection = penalizePrecedingMove(updatedCollection, aiGameMoves);
      if (aiGameMoves.length >= 2) {
        const precedingMove = aiGameMoves[aiGameMoves.length - 2];
        setLastRemovedBead(precedingMove.color);
        setActiveBoardState(precedingMove.boardState);
      } else {
        const lastMove = aiGameMoves[aiGameMoves.length - 1];
        setLastRemovedBead(lastMove.color);
        setActiveBoardState(lastMove.boardState);
      }
      setActiveBeadColor(null);
    } else {
      updatedCollection.losses++;
      updatedCollection.gamesPlayed++;
    }

    setScores((s) => ({ ...s, human: s.human + 1 }));
    setMessage("Computer resigns! (Empty matchbox) A bead was removed.");
    saveGameResult("win");
    setCollection(updatedCollection);
    saveCollection(updatedCollection);
    gamesPlayedRef.current = updatedCollection.gamesPlayed;
    checkCheckpoints(updatedCollection.gamesPlayed);
  }, [collection, aiGameMoves]);

  const doAiTurn = useCallback(
    (currentBoard: Board, currentLastKingMade: Player | null) => {
      setIsAiThinking(true);
      setAiThinkingPhase("picking");
      setMessage("Computer is thinking...");

      const boardState = serializeBoard(currentBoard);
      setActiveBoardState(boardState);

      setTimeout(() => {
        const result = aiPickMove(collection, currentBoard);

        if (!result) {
          setAiThinkingPhase(null);
          setIsAiThinking(false);
          setActiveBeadColor(null);
          aiResign();
          return;
        }

        const { move: aiMove, updatedCollection } = result;
        setCollection(updatedCollection);
        setAiSelectedBead(aiMove.color);
        setActiveBeadColor(aiMove.color);
        setAiThinkingPhase("moving");
        setAiGameMoves((prev) => [...prev, aiMove]);

        setTimeout(() => {
          const engineMove = deserializeMove(aiMove.moveStr);

          // Check if this move promotes to king
          const piece = currentBoard[engineMove.from.row][engineMove.from.col];
          if (piece && piece.player === "black" && engineMove.to.row === 3) {
            engineMove.promotesToKing = true;
          }

          const newBoard = applyMove(currentBoard, engineMove);
          setBoard(newBoard);
          setLastAiMove({
            from: engineMove.from,
            to: engineMove.to,
            color: aiMove.color,
          });

          const justMadeKing = engineMove.promotesToKing || false;
          const { result: gameRes, newLastKingMade } = checkGameResult(
            newBoard,
            "black",
            currentLastKingMade,
            justMadeKing
          );
          setLastKingMade(newLastKingMade);

          if (gameRes) {
            endGame(gameRes);
          } else {
            setCurrentTurn("white");
            setMessage("Your turn! Drag a white piece.");
          }

          setIsAiThinking(false);
          setAiThinkingPhase(null);
          setAiSelectedBead(null);
          // Keep activeBoardState set so the current matchbox stays highlighted
        }, 700);
      }, 900);
    },
    [collection, aiResign, endGame]
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (currentTurn !== "white" || gameResult || isAiThinking) return;

    const id = event.active.id as string;
    const [row, col] = id.split("-").map(Number);

    const pieceMoves = validMoves.filter(
      (m) => m.from.row === row && m.from.col === col
    );
    setSelectedPiece({ row, col });
    setHighlightedMoves(pieceMoves);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setSelectedPiece(null);
    setHighlightedMoves([]);

    if (currentTurn !== "white" || gameResult || isAiThinking) return;
    if (!event.over) return;

    const fromId = event.active.id as string;
    const toId = event.over.id as string;
    const [fromRow, fromCol] = fromId.split("-").map(Number);
    const [toRow, toCol] = toId.split("-").map(Number);

    const move = validMoves.find(
      (m) =>
        m.from.row === fromRow &&
        m.from.col === fromCol &&
        m.to.row === toRow &&
        m.to.col === toCol
    );

    if (!move) return;

    const newBoard = applyMove(board, move);
    setBoard(newBoard);
    setLastAiMove(null);
    setLastRemovedBead(null);

    const justMadeKing = move.promotesToKing || false;
    const { result: gameRes, newLastKingMade } = checkGameResult(
      newBoard,
      "white",
      lastKingMade,
      justMadeKing
    );
    setLastKingMade(newLastKingMade);

    if (gameRes) {
      endGame(gameRes);
    } else {
      setCurrentTurn("black");
      doAiTurn(newBoard, newLastKingMade);
    }
  };

  const handleNewGame = () => {
    setBoard(createInitialBoard());
    setCurrentTurn("white");
    setValidMoves([]);
    setSelectedPiece(null);
    setGameResult(null);
    setLastKingMade(null);
    setAiGameMoves([]);
    setIsAiThinking(false);
    setLastAiMove(null);
    setMessage("Your turn! Drag a white piece.");
    setAiThinkingPhase(null);
    setAiSelectedBead(null);
    setLastRemovedBead(null);
    setActiveBoardState(null);
    setActiveBeadColor(null);
    setHighlightedMoves([]);
  };

  const handleResetAI = () => {
    resetAI();
    const fresh = createMatchboxCollection();
    setCollection(fresh);
    setScores({ human: 0, computer: 0, draws: 0 });
    gamesPlayedRef.current = 0;
    handleNewGame();
  };

  const checkCheckpoints = (games: number) => {
    if (typeof window === "undefined") return;
    const shownKey = "matchbox-checkers-checkpoints";
    const shown = JSON.parse(localStorage.getItem(shownKey) || "[]");

    const checkpoints: Record<number, { title: string; message: string }> = {
      3: {
        title: "The Computer is Learning!",
        message:
          "Every time the computer loses, it removes a bead from its matchbox for that move. Over time, bad moves get eliminated. This is reinforcement learning!",
      },
      6: {
        title: "Patterns Emerging",
        message:
          "Notice how some matchboxes have fewer beads now? The computer has learned which moves lead to losses. Empty matchboxes mean it will resign rather than make a known-bad move.",
      },
      10: {
        title: "AI Trained!",
        message:
          "After many games, the computer has become much better. The remaining beads represent strategies that have survived. This is similar to how real machine learning works — through trial and error!",
      },
    };

    if (checkpoints[games] && !shown.includes(games)) {
      shown.push(games);
      localStorage.setItem(shownKey, JSON.stringify(shown));
      setActiveCheckpoint(checkpoints[games]);
    }
  };

  // Render board matching images: VR0 at top = engine Row 3 (Black home at bottom visually is VR3 = engine Row 0)
  // Images show White at top, Black at bottom: VR0(top)=Row3, VR3(bottom)=Row0
  const renderBoard = () => {
    const rows = [];
    for (let displayRow = 0; displayRow < 4; displayRow++) {
      const engineRow = 3 - displayRow; // display row 0 = engine row 3 (matches VR0 = top)
      const cells = [];
      for (let col = 0; col < 4; col++) {
        const cell = board[engineRow][col];
        const dark = isDarkSquare(engineRow, col);
        const isValidTarget = highlightedMoves.some(
          (m) => m.to.row === engineRow && m.to.col === col
        );
        const isLastAiFrom =
          lastAiMove?.from.row === engineRow && lastAiMove?.from.col === col;
        const isLastAiTo =
          lastAiMove?.to.row === engineRow && lastAiMove?.to.col === col;

        cells.push(
          <DroppableCell
            key={`${engineRow}-${col}`}
            id={`${engineRow}-${col}`}
            dark={dark}
            isValidTarget={isValidTarget}
            isLastAiFrom={isLastAiFrom}
            isLastAiTo={isLastAiTo}
            aiMoveColor={lastAiMove?.color}
          >
            {cell && (
              <DraggablePiece
                id={`${engineRow}-${col}`}
                player={cell.player}
                type={cell.type}
                disabled={
                  cell.player !== "white" ||
                  currentTurn !== "white" ||
                  !!gameResult ||
                  isAiThinking
                }
              />
            )}
          </DroppableCell>
        );
      }
      rows.push(
        <div key={displayRow} className="flex">
          {cells}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Header */}
      <header className="bg-black text-white py-3 px-6 flex items-center gap-3 shadow-md">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <div className="w-5 h-5 bg-black rounded-full"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Matchbox Checkers</h1>
        <span className="text-gray-400 text-sm ml-2">4×4 AI Learning Game</span>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1400px] mx-auto">
        {/* Left: Game Board Section */}
        <div className="flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            {/* Direction labels */}
            <div className="flex justify-between mb-2 text-xs text-gray-500 font-medium px-1">
              <span>WHITE (You) ↑</span>
              <span>BLACK (Computer) ↓</span>
            </div>

            {/* Board */}
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="border-2 border-gray-800 rounded-lg overflow-hidden inline-block">
                {renderBoard()}
              </div>
            </DndContext>

            {/* Status */}
            <AnimatePresence mode="wait">
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-4 text-center"
              >
                <p
                  className={`text-sm font-medium ${
                    gameResult
                      ? gameResult === "white_wins"
                        ? "text-green-600"
                        : gameResult === "black_wins"
                        ? "text-red-600"
                        : "text-amber-600"
                      : "text-gray-700"
                  }`}
                >
                  {message}
                </p>
                {aiThinkingPhase && (
                  <p className="text-xs text-gray-500 mt-1">
                    {aiThinkingPhase === "picking"
                      ? "🎲 Picking a bead..."
                      : "♟️ Making a move..."}
                    {aiSelectedBead && (
                      <span
                        className="inline-block w-3 h-3 rounded-full ml-2 align-middle"
                        style={{ backgroundColor: aiSelectedBead }}
                      ></span>
                    )}
                  </p>
                )}
                {lastRemovedBead && (
                  <p className="text-xs text-red-500 mt-1">
                    ❌ Removed bead:{" "}
                    <span
                      className="inline-block w-3 h-3 rounded-full align-middle border border-red-300"
                      style={{ backgroundColor: lastRemovedBead }}
                    ></span>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Score */}
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-gray-500">You</div>
                <div className="font-bold text-lg">{scores.human}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Draws</div>
                <div className="font-bold text-lg">{scores.draws}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Computer</div>
                <div className="font-bold text-lg">{scores.computer}</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleNewGame}
                className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                New Game
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAI}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Reset AI
                </button>
                <button
                  onClick={() => setShowLearningCurve(true)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  📈 Learning
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
              Games played: {collection.gamesPlayed}
            </p>
          </div>
        </div>

        {/* Right: Matchbox Panel */}
        <div className="flex-1 min-w-0">
          <MatchboxPanel
            collection={collection}
            activeBoardState={activeBoardState}
            activeBeadColor={activeBeadColor}
            lastRemovedBead={lastRemovedBead}
          />
        </div>
      </div>

      {/* Popups */}
      {activeCheckpoint && (
        <CheckpointPopup
          title={activeCheckpoint.title}
          message={activeCheckpoint.message}
          onClose={() => setActiveCheckpoint(null)}
        />
      )}
      {showLearningCurve && (
        <LearningCurvePopup onClose={() => setShowLearningCurve(false)} />
      )}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { getGameHistory } from "../lib/matchbox-ai";

interface LearningCurvePopupProps {
  onClose: () => void;
}

export default function LearningCurvePopup({ onClose }: LearningCurvePopupProps) {
  const history = getGameHistory();

  // Calculate cumulative win/loss data
  const data: { game: number; humanWins: number; computerWins: number; draws: number }[] = [];
  let humanWins = 0;
  let computerWins = 0;
  let draws = 0;

  for (let i = 0; i < history.length; i++) {
    if (history[i] === "win") humanWins++;
    else if (history[i] === "loss") computerWins++;
    else draws++;
    data.push({ game: i + 1, humanWins, computerWins, draws });
  }

  const maxGames = Math.max(history.length, 1);
  const maxValue = Math.max(humanWins, computerWins, draws, 1);

  // SVG dimensions
  const width = 400;
  const height = 200;
  const padding = 30;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const getX = (game: number) =>
    padding + (game / maxGames) * graphWidth;
  const getY = (value: number) =>
    padding + graphHeight - (value / maxValue) * graphHeight;

  const humanPath =
    data.length > 0
      ? `M ${getX(1)} ${getY(data[0].humanWins)} ` +
        data
          .slice(1)
          .map((d) => `L ${getX(d.game)} ${getY(d.humanWins)}`)
          .join(" ")
      : "";

  const computerPath =
    data.length > 0
      ? `M ${getX(1)} ${getY(data[0].computerWins)} ` +
        data
          .slice(1)
          .map((d) => `L ${getX(d.game)} ${getY(d.computerWins)}`)
          .join(" ")
      : "";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-1">Learning Curve</h2>
        <p className="text-xs text-gray-500 mb-4">
          Cumulative wins over time. Watch the computer improve!
        </p>

        {history.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No games played yet. Play some games to see the learning curve!
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                <line
                  key={frac}
                  x1={padding}
                  y1={padding + graphHeight * (1 - frac)}
                  x2={padding + graphWidth}
                  y2={padding + graphHeight * (1 - frac)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {/* Axes */}
              <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={padding + graphHeight}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <line
                x1={padding}
                y1={padding + graphHeight}
                x2={padding + graphWidth}
                y2={padding + graphHeight}
                stroke="#9ca3af"
                strokeWidth="1"
              />

              {/* Human wins line (green) */}
              {humanPath && (
                <path
                  d={humanPath}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Computer wins line (red) */}
              {computerPath && (
                <path
                  d={computerPath}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Labels */}
              <text x={padding} y={height - 5} fontSize="10" fill="#6b7280">
                Games
              </text>
              <text x={5} y={padding + 5} fontSize="10" fill="#6b7280">
                {maxValue}
              </text>
              <text
                x={padding + graphWidth}
                y={height - 5}
                fontSize="10"
                fill="#6b7280"
                textAnchor="end"
              >
                {maxGames}
              </text>
            </svg>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-green-500 rounded"></span>
                Your Wins ({humanWins})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 bg-red-500 rounded"></span>
                Computer Wins ({computerWins})
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

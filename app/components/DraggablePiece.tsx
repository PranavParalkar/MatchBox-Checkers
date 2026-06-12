"use client";

import { useDraggable } from "@dnd-kit/core";
import { PieceType, Player } from "../lib/game-engine";

interface DraggablePieceProps {
  id: string;
  player: Player;
  type: PieceType;
  disabled: boolean;
}

export default function DraggablePiece({
  id,
  player,
  type,
  disabled,
}: DraggablePieceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const isWhite = player === "white";
  const isKing = type === "king";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`
        w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
        transition-shadow duration-200
        ${isDragging ? "shadow-2xl scale-110" : "shadow-md"}
        ${
          isWhite
            ? "bg-white border-3 border-gray-800"
            : "bg-gray-900 border-3 border-gray-300"
        }
        ${!disabled && !isDragging ? "cursor-grab hover:shadow-lg" : ""}
        ${disabled ? "cursor-default" : ""}
        ${isDragging ? "cursor-grabbing" : ""}
      `}
    >
      {isKing && (
        <span className={`text-lg font-bold ${isWhite ? "text-gray-800" : "text-white"}`}>
          ♛
        </span>
      )}
    </div>
  );
}

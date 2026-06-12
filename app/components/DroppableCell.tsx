"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableCellProps {
  id: string;
  dark: boolean;
  isValidTarget: boolean;
  isLastAiFrom: boolean;
  isLastAiTo: boolean;
  aiMoveColor?: string;
  children: ReactNode;
}

export default function DroppableCell({
  id,
  dark,
  isValidTarget,
  isLastAiFrom,
  isLastAiTo,
  aiMoveColor,
  children,
}: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center relative
        ${dark ? "bg-gray-800" : "bg-gray-100"}
        ${isValidTarget ? "ring-4 ring-inset ring-green-400" : ""}
        ${isOver && isValidTarget ? "bg-green-900/30" : ""}
        ${isLastAiTo ? "ring-4 ring-inset ring-amber-400" : ""}
        ${isLastAiFrom ? "ring-2 ring-inset ring-amber-300/50" : ""}
      `}
    >
      {children}
      {isValidTarget && !children && (
        <div className="w-4 h-4 rounded-full bg-green-400/60"></div>
      )}
    </div>
  );
}

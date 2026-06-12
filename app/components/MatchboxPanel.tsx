"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MatchboxCollection } from "../lib/matchbox-ai";
import { getImagePath, getStatesForChance } from "../lib/state-mapping";
import { getInitialBeadsForImage } from "../lib/bead-definitions";
import Image from "next/image";

interface MatchboxPanelProps {
  collection: MatchboxCollection;
  activeBoardState: string | null;
  activeBeadColor: string | null;
  lastRemovedBead: string | null;
}

export default function MatchboxPanel({
  collection,
  activeBoardState,
  activeBeadColor,
  lastRemovedBead,
}: MatchboxPanelProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeBoardState && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeBoardState]);

  const chances = [0, 1, 2, 3];
  const chanceLabels = ["2nd Move", "4th Move", "6th Move", "8th Move"];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-1">
        Computer&apos;s Matchboxes
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Each matchbox contains colored beads — one per possible move. Matchboxes appear as the game reaches new stages.
      </p>

      {chances.map((chance) => {
        const states = getStatesForChance(chance);
        if (states.length === 0) return null;

        return (
          <div
            key={chance}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">
              {chanceLabels[chance]} — Black&apos;s {chance + 1}
              {chance === 0 ? "st" : chance === 1 ? "nd" : chance === 2 ? "rd" : "th"} move
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {states.map((state) => {
                const isActive = activeBoardState === state.boardState;
                const matchbox = collection.boxes[state.boardState];
                const initialBeads = getInitialBeadsForImage(
                  state.chance,
                  state.imageIndex
                );
                const currentBeads = matchbox?.beads || [];
                const imagePath = getImagePath(state.chance, state.imageIndex);

                return (
                  <motion.div
                    key={`${state.chance}-${state.imageIndex}`}
                    ref={isActive ? activeRef : undefined}
                    animate={
                      isActive ? { scale: [1, 1.03, 1] } : {}
                    }
                    transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                    className={`
                      rounded-lg border-2 p-2 transition-all relative
                      ${
                        isActive
                          ? "border-green-500 shadow-xl shadow-green-200 bg-green-50 ring-2 ring-green-300"
                          : "border-gray-200 bg-gray-50"
                      }
                    `}
                  >
                    {/* Active bead indicator at the top */}
                    {isActive && activeBeadColor && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white border-2 border-green-500 rounded-full px-2 py-0.5 shadow">
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-sm"
                          style={{ backgroundColor: activeBeadColor }}
                        ></div>
                        <span className="text-[9px] font-bold text-green-700">USED</span>
                      </div>
                    )}

                    {/* Removed bead indicator */}
                    {isActive && lastRemovedBead && !activeBeadColor && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white border-2 border-red-400 rounded-full px-2 py-0.5 shadow">
                        <div
                          className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-red-400"
                          style={{ backgroundColor: `${lastRemovedBead}33` }}
                        ></div>
                        <span className="text-[9px] font-bold text-red-600">REMOVED</span>
                      </div>
                    )}

                    {/* State image */}
                    <div className="relative w-full aspect-square mb-2 rounded overflow-hidden bg-white">
                      <Image
                        src={imagePath}
                        alt={`State ${state.chance}-${state.imageIndex}`}
                        fill
                        className="object-contain"
                        sizes="120px"
                      />
                    </div>

                    {/* Beads display — show actual current beads */}
                    <div className="flex flex-wrap gap-1 justify-center">
                      {matchbox ? (
                        currentBeads.length > 0 ? (
                          currentBeads.map((bead, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: bead.color }}
                            ></div>
                          ))
                        ) : (
                          // Empty matchbox — show dashed circles for removed beads
                          initialBeads.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border-2 border-dashed border-red-400 bg-transparent"
                            ></div>
                          ))
                        )
                      ) : (
                        // Not yet encountered: show initial beads
                        initialBeads.map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

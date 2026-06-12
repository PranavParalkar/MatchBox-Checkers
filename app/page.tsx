"use client";

import { useState, useEffect } from "react";
import LandingScreen from "./components/LandingScreen";
import InstructionPopup from "./components/InstructionPopup";
import GameBoard from "./components/GameBoard";

type Phase = "landing" | "instructions" | "game";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const visited = localStorage.getItem("matchbox-checkers-visited");
      if (visited) {
        setHasVisited(true);
      }
    }
  }, []);

  const handleStart = () => {
    if (hasVisited) {
      setPhase("game");
    } else {
      setPhase("instructions");
    }
  };

  const handleInstructionsComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("matchbox-checkers-visited", "true");
    }
    setHasVisited(true);
    setPhase("game");
  };

  if (phase === "landing") {
    return <LandingScreen onStart={handleStart} />;
  }

  if (phase === "instructions") {
    return (
      <>
        <GameBoard />
        <InstructionPopup onComplete={handleInstructionsComplete} />
      </>
    );
  }

  return <GameBoard />;
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InstructionPopupProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome!",
    content:
      "This is a 4×4 mini-checkers game. You play as White (bottom pieces) against a computer that learns through reinforcement learning. The computer uses 'matchboxes' filled with colored beads to decide its moves.",
    icon: "🎲",
  },
  {
    title: "How to Play",
    content:
      "Pieces move diagonally forward on dark squares. To capture, jump over an opponent's piece to the empty square beyond. If a capture is available, you MUST take it. Reach the opponent's back row to become a King (moves in all diagonal directions).",
    icon: "♟️",
  },
  {
    title: "Win Conditions",
    content:
      "Win by: (1) Capturing all opponent pieces, (2) Blocking all opponent moves, or (3) Making a King when your opponent can't make one on their next turn. If both sides make Kings within one turn of each other, it's a draw!",
    icon: "🏆",
  },
];

export default function InstructionPopup({ onComplete }: InstructionPopupProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center mb-4">
              <span className="text-4xl">{steps[step].icon}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-3">
              {steps[step].title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed text-center">
              {steps[step].content}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-5 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === step ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            {step < steps.length - 1 ? "Next" : "Let's Play!"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

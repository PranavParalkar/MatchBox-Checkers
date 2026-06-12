"use client";

import { motion } from "framer-motion";

interface LandingScreenProps {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-gray-600 rounded-full"
            />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
          Matchbox Checkers
        </h1>
        <p className="text-gray-400 text-lg mb-2">
          A Machine Learning Experiment
        </p>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          Play against a computer that learns from its mistakes.
          Each loss removes a &quot;bead&quot; — a possible move — from its memory.
          Watch it get smarter over time.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-white text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Start Playing
        </motion.button>

        <p className="text-gray-600 text-xs mt-6">
          4×4 Board • 2 vs 2 Checkers • Reinforcement Learning
        </p>
      </motion.div>
    </div>
  );
}

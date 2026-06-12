"use client";

import { motion } from "framer-motion";

interface CheckpointPopupProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function CheckpointPopup({
  title,
  message,
  onClose,
}: CheckpointPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="text-center mb-3">
          <span className="text-3xl">🧠</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 text-center mb-2">
          {title}
        </h2>
        <p className="text-gray-600 text-sm text-center leading-relaxed mb-5">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Got it!
        </button>
      </motion.div>
    </div>
  );
}

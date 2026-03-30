"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLongPress } from "@/hooks/useLongPress";

interface BuzzButtonProps {
  onBuzz: () => Promise<void>;
  disabled?: boolean;
}

export function BuzzButton({ onBuzz, disabled }: BuzzButtonProps) {
  const [buzzed, setBuzzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (loading || buzzed) return;
    setLoading(true);
    await onBuzz();
    setBuzzed(true);
    setLoading(false);
  };

  const { isPressing, progress, handlers } = useLongPress({
    duration: 3000,
    onFinish: handleFinish,
  });

  if (buzzed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500 text-center"
      >
        <div className="text-3xl mb-2">🚨</div>
        <p className="text-amber-300 font-black text-lg">搶答成功！</p>
        <p className="text-slate-300 text-sm mt-1">請向全班大聲說出你的答案！</p>
      </motion.div>
    );
  }

  return (
    <div className="relative select-none">
      {/* 長按進度環 */}
      {isPressing && (
        <div className="absolute -inset-2 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="h-full bg-red-500/30 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        {...handlers}
        disabled={disabled || loading}
        className={`relative w-full py-5 rounded-2xl font-black text-xl tracking-wide transition-all select-none overflow-hidden
          ${
            isPressing
              ? "bg-red-600 border-2 border-red-400 scale-[0.98] shadow-lg shadow-red-500/50"
              : "bg-gradient-to-b from-red-600 to-red-700 border-2 border-red-500 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/30"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          active:scale-[0.97]
        `}
      >
        <AnimatePresence mode="wait">
          {isPressing ? (
            <motion.span
              key="pressing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-white"
            >
              <span className="text-2xl">🔴</span>
              <span>持續長按... {Math.round((progress / 100) * 3)}s</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-white"
            >
              <span className="text-2xl">🚨</span>
              <span>破解真相</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <p className="text-center text-xs text-slate-600 font-mono mt-2">
        長按 3 秒以觸發搶答
      </p>
    </div>
  );
}

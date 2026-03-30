"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

interface ConfettiOverlayProps {
  trueNeed: string;
  buzzTeamName?: string | null;
  onClose: () => void;
}

export function ConfettiOverlay({ trueNeed, buzzTeamName, onClose }: ConfettiOverlayProps) {
  useEffect(() => {
    // 多波彩帶效果
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.6 },
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      });
    };

    const launch = () => {
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    };

    launch();
    const timer1 = setTimeout(launch, 600);
    const timer2 = setTimeout(launch, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="text-center max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題 */}
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-black text-white mb-2 text-glow">
          真相揭曉！
        </h1>

        {buzzTeamName && (
          <div className="mb-6">
            <span className="inline-block bg-amber-400/20 border border-amber-400/40 text-amber-300 px-4 py-1.5 rounded-full text-lg font-bold">
              🚨 {buzzTeamName} 搶先破解！
            </span>
          </div>
        )}

        {/* 真相內容 */}
        <div className="cyber-card p-8 rounded-2xl text-left mt-4 glow-border">
          <div className="text-xs font-mono text-cyan-400 tracking-widest mb-3">
            💡 TRUE NEED — 湯底真相
          </div>
          <p className="text-white text-xl leading-relaxed font-medium">{trueNeed}</p>
        </div>

        <p className="text-slate-500 text-sm mt-6 font-mono">
          點擊任意處關閉
        </p>
      </motion.div>
    </motion.div>
  );
}

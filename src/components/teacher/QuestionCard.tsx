"use client";

import { motion } from "framer-motion";
import type { Question, QuestionStatus } from "@/types";

interface QuestionCardProps {
  question: Question;
  onJudge: (questionId: string, status: QuestionStatus) => void;
  rank?: number;
}

export function QuestionCard({ question, onJudge, rank }: QuestionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className="cyber-card rounded-xl p-4 border border-[#1e3a5f]"
    >
      <div className="flex items-start gap-3">
        {/* 排名徽章 */}
        {rank !== undefined && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">
            {rank + 1}
          </div>
        )}

        {/* 問題內容 */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium leading-snug">{question.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-slate-500 text-xs font-mono">{question.team_name}</span>
            <span className="flex items-center gap-1 text-amber-400 text-xs font-mono">
              <span>❤️</span>
              <span>{question.upvotes}</span>
            </span>
          </div>
        </div>

        {/* 判定按鈕 */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onJudge(question.id, "yes")}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 text-emerald-400 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            title="YES - 方向正確"
          >
            ✅
          </button>
          <button
            onClick={() => onJudge(question.id, "no")}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-400 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            title="NO - 錯誤方向"
          >
            ❌
          </button>
          <button
            onClick={() => onJudge(question.id, "irrelevant")}
            className="px-3 py-1.5 rounded-lg bg-gray-500/20 hover:bg-gray-500/40 border border-gray-500/40 text-gray-400 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            title="無關"
          >
            ➖
          </button>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/types";

interface ClueBoardProps {
  yesQuestions: Question[];
  noQuestions: Question[];
}

function ClueItem({ question, type }: { question: Question; type: "yes" | "no" }) {
  const isYes = type === "yes";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.5, y: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`px-3 py-2 rounded-lg text-sm font-medium border ${
        isYes
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : "bg-red-500/10 border-red-500/30 text-red-300 line-through decoration-red-500/50"
      }`}
    >
      <span className="mr-1.5">{isYes ? "✅" : "❌"}</span>
      {question.content}
      <span className="ml-2 text-xs opacity-50 font-mono no-underline">{question.team_name}</span>
    </motion.div>
  );
}

export function ClueBoard({ yesQuestions, noQuestions }: ClueBoardProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* YES 欄 */}
      <div className="cyber-card rounded-xl p-4 border-emerald-500/20 border">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-emerald-400 text-sm font-mono tracking-widest">✅ 已確認事實</span>
          <span className="text-xs bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
            {yesQuestions.length}
          </span>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100%-40px)]">
          <AnimatePresence>
            {yesQuestions.length === 0 ? (
              <p className="text-slate-600 text-xs font-mono text-center pt-4">
                尚無確認事實
              </p>
            ) : (
              yesQuestions.map((q) => (
                <ClueItem key={q.id} question={q} type="yes" />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NO 欄 */}
      <div className="cyber-card rounded-xl p-4 border-red-500/20 border">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-400 text-sm font-mono tracking-widest">❌ 錯誤方向</span>
          <span className="text-xs bg-red-400/10 text-red-400 px-1.5 py-0.5 rounded font-mono">
            {noQuestions.length}
          </span>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100%-40px)]">
          <AnimatePresence>
            {noQuestions.length === 0 ? (
              <p className="text-slate-600 text-xs font-mono text-center pt-4">
                尚無排除方向
              </p>
            ) : (
              noQuestions.map((q) => (
                <ClueItem key={q.id} question={q} type="no" />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

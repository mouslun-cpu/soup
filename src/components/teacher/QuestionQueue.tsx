"use client";

import { AnimatePresence } from "framer-motion";
import { QuestionCard } from "./QuestionCard";
import type { Question, QuestionStatus } from "@/types";

interface QuestionQueueProps {
  questions: Question[];
  onJudge: (questionId: string, status: QuestionStatus) => void;
}

export function QuestionQueue({ questions, onJudge }: QuestionQueueProps) {
  const pending = questions
    .filter((q) => q.status === "pending")
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5); // 顯示讚數最高的前 5 題

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono text-slate-300 tracking-widest">
          🔥 待審核提問
        </h3>
        <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
          {pending.length} 則
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence mode="popLayout">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-600">
              <span className="text-3xl mb-2">💬</span>
              <span className="text-sm font-mono">等待學生提問...</span>
            </div>
          ) : (
            pending.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                onJudge={onJudge}
                rank={i}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

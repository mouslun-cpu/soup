"use client";

import { motion } from "framer-motion";
import type { Question } from "@/types";

interface QuestionItemProps {
  question: Question;
  hasUpvoted: boolean;
  onUpvote: (questionId: string) => void;
  currentTeamName?: string;
}

const STATUS_STYLE = {
  pending: { label: "待審", className: "status-pending" },
  yes: { label: "✅ YES", className: "status-yes" },
  no: { label: "❌ NO", className: "status-no" },
  irrelevant: { label: "➖ 無關", className: "status-irrelevant" },
};

export function QuestionItem({
  question,
  hasUpvoted,
  onUpvote,
  currentTeamName,
}: QuestionItemProps) {
  const isJudged = question.status !== "pending";
  const isMyQuestion = question.team_name === currentTeamName;
  const status = STATUS_STYLE[question.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: isJudged ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        isJudged
          ? "bg-[#111827]/50 border-[#1e3a5f]/30"
          : "bg-[#1a2235] border-[#1e3a5f] hover:border-[#1e5a8f]"
      }`}
    >
      {/* 問題主體 */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            isJudged ? "text-slate-500" : "text-slate-200"
          } ${question.status === "no" ? "line-through" : ""}`}
        >
          {question.content}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-600 font-mono">{question.team_name}</span>
          {isMyQuestion && (
            <span className="text-xs text-cyan-500 font-mono">（我們）</span>
          )}
          {isJudged && (
            <span className={status.className}>{status.label}</span>
          )}
        </div>
      </div>

      {/* 點讚按鈕 */}
      <button
        onClick={() => !hasUpvoted && !isJudged && onUpvote(question.id)}
        disabled={hasUpvoted || isJudged}
        className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
          hasUpvoted
            ? "bg-pink-500/20 text-pink-400 border border-pink-500/30 cursor-default"
            : isJudged
            ? "text-slate-600 cursor-default"
            : "bg-[#0a0e1a] border border-[#1e3a5f] text-slate-400 hover:border-pink-500/50 hover:text-pink-400 active:scale-90"
        }`}
      >
        <span>{hasUpvoted ? "❤️" : "🤍"}</span>
        <span className="font-mono text-xs">{question.upvotes}</span>
      </button>
    </motion.div>
  );
}

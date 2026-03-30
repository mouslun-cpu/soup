"use client";

import { AnimatePresence } from "framer-motion";
import { QuestionItem } from "./QuestionItem";
import type { Question } from "@/types";

interface LiveFeedProps {
  questions: Question[];
  onUpvote: (questionId: string) => void;
  upvotedIds: string[];
  currentTeamName?: string;
}

export function LiveFeed({ questions, onUpvote, upvotedIds, currentTeamName }: LiveFeedProps) {
  const pendingQuestions = questions.filter((q) => q.status === "pending");
  const judgedQuestions = questions.filter((q) => q.status !== "pending");

  return (
    <div className="cyber-card rounded-2xl p-4 flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-xs font-mono text-slate-400 tracking-widest">
          🔴 LIVE 全班提問池
        </h3>
        <span className="text-xs font-mono text-slate-500">
          {questions.length} 則問題
        </span>
      </div>

      <div className="overflow-y-auto flex-1 space-y-2 -mr-1 pr-1">
        <AnimatePresence mode="popLayout">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <div className="text-3xl mb-2">💭</div>
              <p className="text-sm font-mono">還沒有人提問，搶先發問吧！</p>
            </div>
          ) : (
            <>
              {pendingQuestions.map((q) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  hasUpvoted={upvotedIds.includes(q.id)}
                  onUpvote={onUpvote}
                  currentTeamName={currentTeamName}
                />
              ))}
              {judgedQuestions.length > 0 && pendingQuestions.length > 0 && (
                <div className="text-center text-xs text-slate-600 font-mono py-1">
                  ─── 已判定問題 ───
                </div>
              )}
              {judgedQuestions.map((q) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  hasUpvoted={upvotedIds.includes(q.id)}
                  onUpvote={onUpvote}
                  currentTeamName={currentTeamName}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRoom } from "@/hooks/useRoom";
import { useQuestions } from "@/hooks/useQuestions";
import { useGameStore } from "@/store/gameStore";
import { supabase } from "@/lib/supabase/client";
import { QuestionInput } from "@/components/student/QuestionInput";
import { LiveFeed } from "@/components/student/LiveFeed";
import { BuzzButton } from "@/components/student/BuzzButton";
import { ConfettiOverlay } from "@/components/shared/ConfettiOverlay";

interface PageProps {
  params: Promise<{ roomCode: string }>;
}

export default function StudentGamePage({ params }: PageProps) {
  const { roomCode } = use(params);
  const router = useRouter();
  const { room, loading: roomLoading } = useRoom(roomCode);
  const { currentTeam, addUpvote, hasUpvoted, upvotedQuestionIds, setRoom, _hasHydrated } = useGameStore();
  const { questions, submitQuestion, upvoteQuestion } = useQuestions(room?.id ?? null);
  const [showReveal, setShowReveal] = useState(false);

  // 等 Zustand 從 localStorage 恢復後再判斷，避免未恢復就誤跳轉
  useEffect(() => {
    if (!_hasHydrated || roomLoading) return;
    if (!currentTeam) {
      router.push(`/student?code=${roomCode}`);
    }
  }, [_hasHydrated, roomLoading, currentTeam, roomCode, router]);

  // 同步房間到 store
  useEffect(() => {
    if (room) setRoom(room);
  }, [room, setRoom]);

  // 監聽揭曉事件
  useEffect(() => {
    if (room?.reveal_triggered) {
      setShowReveal(true);
    }
  }, [room?.reveal_triggered]);

  const handleSubmit = async (content: string): Promise<boolean> => {
    if (!currentTeam || !room) return false;
    return submitQuestion(content, currentTeam.id, currentTeam.team_name);
  };

  const handleUpvote = async (questionId: string) => {
    if (!currentTeam || hasUpvoted(questionId)) return;
    const ok = await upvoteQuestion(questionId, currentTeam.id);
    if (ok) addUpvote(questionId);
  };

  const handleBuzz = async () => {
    if (!room || !currentTeam) return;
    await supabase
      .from("rooms")
      .update({
        buzz_triggered: true,
        buzz_team_name: currentTeam.team_name,
      })
      .eq("id", room.id);
  };

  if (!_hasHydrated || roomLoading || !currentTeam) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">載入中...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 font-mono">找不到房間</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col" style={{ maxHeight: "100dvh" }}>
      {/* ── 頂部欄 ── */}
      <header className="flex-shrink-0 border-b border-[#1e3a5f] bg-[#0a0e1a]/90 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500">{room.story_title}</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              {currentTeam.team_name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-slate-600">ROOM</div>
            <div className="text-base font-black font-mono text-white tracking-widest">
              {roomCode}
            </div>
          </div>
        </div>
      </header>

      {/* ── 湯面（可展開） ── */}
      <div className="flex-shrink-0 px-4 pt-3">
        <details className="cyber-card rounded-xl">
          <summary className="px-4 py-3 cursor-pointer text-sm font-mono text-slate-300 list-none flex items-center justify-between">
            <span>🐢 查看題目</span>
            <span className="text-slate-500 text-xs">點擊展開</span>
          </summary>
          <div className="px-4 pb-4">
            <p className="text-white text-sm leading-relaxed">{room.story_content}</p>
          </div>
        </details>
      </div>

      {/* ── 主體區域（可滾動） ── */}
      <div className="flex-1 overflow-hidden flex flex-col gap-3 px-4 py-3 min-h-0">
        {/* 提問輸入 */}
        <div className="flex-shrink-0">
          <QuestionInput
            onSubmit={handleSubmit}
            disabled={room.reveal_triggered}
          />
        </div>

        {/* 動態提問池 */}
        <LiveFeed
          questions={questions}
          onUpvote={handleUpvote}
          upvotedIds={upvotedQuestionIds}
          currentTeamName={currentTeam.team_name}
        />
      </div>

      {/* ── 搶答核彈鈕（固定在底部） ── */}
      <div className="flex-shrink-0 px-4 pb-safe pb-4 pt-2 border-t border-[#1e3a5f] bg-[#0a0e1a]/90 backdrop-blur-sm">
        <BuzzButton
          onBuzz={handleBuzz}
          disabled={room.reveal_triggered || room.buzz_triggered}
        />
      </div>

      {/* ── 搶答通知（其他人搶先） ── */}
      {room.buzz_triggered && room.buzz_team_name !== currentTeam.team_name && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8"
          >
            <div className="text-5xl mb-3">🚨</div>
            <p className="text-2xl font-black text-white">{room.buzz_team_name}</p>
            <p className="text-slate-300 text-lg mt-1">搶先按下搶答！</p>
          </motion.div>
        </div>
      )}

      {/* ── 揭曉特效 ── */}
      <AnimatePresence>
        {showReveal && (
          <ConfettiOverlay
            trueNeed={room.true_need}
            buzzTeamName={room.buzz_team_name}
            onClose={() => setShowReveal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { use, useEffect, useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useRoom } from "@/hooks/useRoom";
import { useQuestions } from "@/hooks/useQuestions";
import { useTeams } from "@/hooks/useTeams";
import { supabase } from "@/lib/supabase/client";
import { RoomInfoPanel } from "@/components/teacher/RoomInfoPanel";
import { StoryArea } from "@/components/teacher/StoryArea";
import { QuestionQueue } from "@/components/teacher/QuestionQueue";
import { ClueBoard } from "@/components/teacher/ClueBoard";
import { ConfettiOverlay } from "@/components/shared/ConfettiOverlay";
import type { QuestionStatus } from "@/types";

interface PageProps {
  params: Promise<{ roomCode: string }>;
}

export default function TeacherDashboard({ params }: PageProps) {
  const { roomCode } = use(params);
  const { room, loading: roomLoading } = useRoom(roomCode);
  const { questions, judgeQuestion } = useQuestions(room?.id ?? null);
  const { teams } = useTeams(room?.id ?? null);
  const [showReveal, setShowReveal] = useState(false);

  // 用 state + useEffect 確保 joinUrl 只在 client side 產生，避免 hydration mismatch
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const joinUrl = origin ? `${origin}/student?code=${roomCode}` : "";

  const handleJudge = async (questionId: string, status: QuestionStatus) => {
    await judgeQuestion(questionId, status);
  };

  const handleReveal = async () => {
    if (!room) return;
    await supabase
      .from("rooms")
      .update({ reveal_triggered: true })
      .eq("id", room.id);
    setShowReveal(true);
  };

  const yesQuestions = questions.filter((q) => q.status === "yes");
  const noQuestions = questions.filter((q) => q.status === "no");

  if (roomLoading) {
    return (
      <div className="min-h-screen cyber-grid-bg flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse text-lg">
          載入房間中...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 font-mono">找不到房間：{roomCode}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid-bg flex flex-col overflow-hidden" style={{ height: "100vh" }}>
      {/* ── 頂部欄 ── */}
      <header className="flex-shrink-0 border-b border-[#1e3a5f] bg-[#0a0e1a]/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <RoomInfoPanel
            teamCount={teams.length}
            joinUrl={joinUrl}
          />

          {/* 揭曉按鈕 */}
          <button
            onClick={handleReveal}
            className="relative flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30 animate-pulse-glow"
          >
            <span className="relative z-10">💡 顯示真相</span>
          </button>
        </div>
      </header>

      {/* ── 主體區域 ── */}
      <main className="flex-1 overflow-hidden grid grid-cols-[1fr_380px] gap-4 p-4">
        {/* 左欄：湯面 + 線索板 */}
        <div className="flex flex-col gap-4 overflow-hidden min-h-0">
          {/* 湯面 */}
          <div className="flex-shrink-0">
            <StoryArea title={room.story_title} content={room.story_content} />
          </div>

          {/* 線索板 */}
          <div className="flex-1 min-h-0">
            <ClueBoard yesQuestions={yesQuestions} noQuestions={noQuestions} />
          </div>
        </div>

        {/* 右欄：待審核提問 */}
        <div className="cyber-card rounded-2xl p-4 overflow-hidden flex flex-col min-h-0">
          <QuestionQueue questions={questions} onJudge={handleJudge} />
        </div>
      </main>

      {/* ── 底部 Buzz 通知 ── */}
      {room.buzz_triggered && room.buzz_team_name && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-500/20 border-2 border-red-500 text-white font-bold text-lg shadow-lg shadow-red-500/30 animate-pulse">
            <span className="text-2xl">🚨</span>
            <span>{room.buzz_team_name} 按下搶答！請他們說出答案！</span>
          </div>
        </div>
      )}

      {/* ── 揭曉特效 ── */}
      <AnimatePresence>
        {showReveal && room && (
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

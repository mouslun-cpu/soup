"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useTeams } from "@/hooks/useTeams";
import { useGameStore } from "@/store/gameStore";

const GROUP_OPTIONS = [
  "第1組", "第2組", "第3組", "第4組", "第5組",
  "第6組", "第7組", "第8組", "第9組", "第10組",
];

function StudentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { joinOrCreateTeam } = useTeams(null);
  const { setRoom, setTeam, currentTeam, currentRoom, reset, _hasHydrated } = useGameStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (currentTeam && currentRoom) {
      if (codeFromUrl && currentRoom.room_code !== codeFromUrl.toUpperCase()) {
        reset();
        return;
      }
      router.push(`/student/${currentRoom.room_code}`);
    }
  }, [_hasHydrated, currentTeam, currentRoom, codeFromUrl, router, reset]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) {
      setError("請選擇組別");
      return;
    }
    if (!codeFromUrl) {
      setError("連結無效，請重新掃描 QR Code");
      return;
    }

    setLoading(true);
    setError("");

    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", codeFromUrl.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (roomError || !roomData) {
      setError("找不到此房間，請重新掃描 QR Code");
      setLoading(false);
      return;
    }

    const team = await joinOrCreateTeam(roomData.id, teamName);
    if (!team) {
      setError("加入小組失敗，請重試");
      setLoading(false);
      return;
    }

    setRoom(roomData);
    setTeam(team);
    router.push(`/student/${roomData.room_code}`);
  };

  return (
    <main className="min-h-screen cyber-grid-bg flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-radial opacity-20 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐢</div>
          <h1 className="text-2xl font-black text-white">加入遊戲</h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">True Need 挖掘機</p>
        </div>

        <form onSubmit={handleJoin} className="cyber-card p-6 rounded-2xl space-y-4">
          <div>
            <label className="block text-sm font-mono text-slate-300 mb-1.5">
              選擇組別
            </label>
            <select
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-[#0a0e1a] border border-[#1e3a5f] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none cursor-pointer text-lg font-bold"
            >
              <option value="" disabled>請選擇你的組別...</option>
              {GROUP_OPTIONS.map((g) => (
                <option key={g} value={g} className="bg-[#1a2235]">{g}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
          >
            {loading ? "加入中..." : "🚀 加入遊戲"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs font-mono mt-6">
          無需帳號，直接遊玩
        </p>
      </div>
    </main>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-cyan-400 font-mono">
        載入中...
      </div>
    }>
      <StudentLoginContent />
    </Suspense>
  );
}

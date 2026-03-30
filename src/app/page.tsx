"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen cyber-grid-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 背景光暈 */}
      <div className="absolute inset-0 bg-glow-radial opacity-30 pointer-events-none" />

      {/* 標題區 */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-block text-xs font-mono text-cyan-400 tracking-[0.3em] mb-4 px-3 py-1 border border-cyan-400/30 rounded-full bg-cyan-400/5">
          CLASSROOM GAME v1.0
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent text-glow">
          True Need
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          挖掘機
        </h2>
        <p className="text-slate-400 text-sm md:text-base font-mono mt-3">
          海龜湯教學版 — 從表面現象挖掘深層需求
        </p>
      </div>

      {/* 角色選擇卡片 */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg relative z-10">
        {/* 老師入口 */}
        <Link href="/teacher" className="flex-1 group">
          <div className="cyber-card p-6 rounded-2xl cursor-pointer transition-all duration-300 group-hover:scale-[1.02] group-hover:glow-border">
            <div className="text-4xl mb-3 text-center">🖥️</div>
            <h3 className="text-lg font-bold text-center text-white mb-1">老師端</h3>
            <p className="text-xs text-slate-400 text-center font-mono">
              建立房間 · 大螢幕投影
            </p>
            <div className="mt-4 w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold text-center group-hover:from-cyan-500 group-hover:to-blue-500 transition-all">
              進入老師模式
            </div>
          </div>
        </Link>

        {/* 學生入口 */}
        <Link href="/student" className="flex-1 group">
          <div className="cyber-card p-6 rounded-2xl cursor-pointer transition-all duration-300 group-hover:scale-[1.02] group-hover:glow-border">
            <div className="text-4xl mb-3 text-center">📱</div>
            <h3 className="text-lg font-bold text-center text-white mb-1">學生端</h3>
            <p className="text-xs text-slate-400 text-center font-mono">
              加入房間 · 提問 · 搶答
            </p>
            <div className="mt-4 w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold text-center group-hover:from-emerald-500 group-hover:to-teal-500 transition-all">
              進入學生模式
            </div>
          </div>
        </Link>
      </div>

      {/* 底部說明 */}
      <p className="absolute bottom-6 text-slate-600 text-xs font-mono">
        © 2025 True Need 挖掘機 · 課堂互動遊戲
      </p>
    </main>
  );
}

"use client";

import { useState } from "react";

interface QuestionInputProps {
  onSubmit: (content: string) => Promise<boolean>;
  disabled?: boolean;
}

export function QuestionInput({ onSubmit, disabled }: QuestionInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<"success" | "error" | null>(null);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || loading || disabled) return;

    setLoading(true);
    const ok = await onSubmit(trimmed);
    setLoading(false);

    if (ok) {
      setValue("");
      setFlash("success");
      setTimeout(() => setFlash(null), 1500);
    } else {
      setFlash("error");
      setTimeout(() => setFlash(null), 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`cyber-card rounded-2xl p-4 transition-all duration-300 ${
        flash === "success"
          ? "border-emerald-500/60 shadow-emerald-500/20 shadow-lg"
          : flash === "error"
          ? "border-red-500/60"
          : "border-[#1e3a5f]"
      }`}
    >
      <div className="text-xs font-mono text-slate-400 mb-3 tracking-wider">
        💬 提出你的問題（只能用「是/否」回答）
      </div>

      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="這個人是否在戶外？&#10;這件事發生在晚上嗎？&#10;有人死掉嗎？"
          maxLength={100}
          rows={2}
          disabled={loading || disabled}
          className="flex-1 bg-[#0a0e1a] border border-[#1e3a5f] rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none disabled:opacity-50"
        />

        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading || disabled}
          className="flex-shrink-0 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm transition-all active:scale-95 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            "送出"
          )}
        </button>
      </div>

      {/* 字數計數 */}
      <div className="text-right mt-1">
        <span className={`text-xs font-mono ${value.length > 80 ? "text-amber-400" : "text-slate-600"}`}>
          {value.length}/100
        </span>
      </div>

      {/* 成功訊息 */}
      {flash === "success" && (
        <div className="text-emerald-400 text-xs font-mono mt-1 animate-slide-up">
          ✅ 問題已送出！
        </div>
      )}
      {flash === "error" && (
        <div className="text-red-400 text-xs font-mono mt-1">
          ❌ 送出失敗，請重試
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

interface RoomInfoPanelProps {
  teamCount: number;
  joinUrl: string;
}

export function RoomInfoPanel({ teamCount, joinUrl }: RoomInfoPanelProps) {
  const [enlarged, setEnlarged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modal = (
    <AnimatePresence>
      {enlarged && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
          style={{ zIndex: 9999 }}
          onClick={() => setEnlarged(false)}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white p-6 rounded-3xl shadow-2xl">
              <QRCodeSVG value={joinUrl} size={280} />
            </div>
            <p className="text-slate-400 text-sm font-mono">點擊任意處關閉</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="flex items-center gap-4">
        {/* QR Code 縮圖 — 點擊放大 */}
        {joinUrl ? (
          <button
            onClick={() => setEnlarged(true)}
            className="bg-white p-2 rounded-xl flex-shrink-0 hover:scale-105 transition-transform cursor-zoom-in"
            title="點擊放大 QR Code"
          >
            <QRCodeSVG value={joinUrl} size={80} />
          </button>
        ) : (
          <div className="w-[96px] h-[96px] bg-[#1a2235] rounded-xl flex-shrink-0 animate-pulse" />
        )}

        {/* 連結 + 小組數 */}
        <div className="min-w-0">
          {/* 連結列 + 複製按鈕 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-500 truncate max-w-[260px]">
              {joinUrl || "載入中..."}
            </span>
            <button
              onClick={handleCopy}
              disabled={!joinUrl}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
              } disabled:opacity-40`}
            >
              {copied ? "✅ 已複製" : "📋 複製連結"}
            </button>
          </div>

          {/* 小組數 */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-3xl font-black text-white">{teamCount}</span>
              <span className="text-slate-400 text-sm ml-1">組已加入</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-emerald-400">直播中</span>
            </div>
          </div>
        </div>
      </div>

      {mounted && createPortal(modal, document.body)}
    </>
  );
}

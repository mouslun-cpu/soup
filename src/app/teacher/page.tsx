"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { generateRoomCode } from "@/lib/utils";

const DEMO_STORIES = [
  {
    title: "坐電梯的男子",
    content: "一個住在30樓的男人，每天早上坐電梯到1樓出門去上班，但晚上回來時，他只坐電梯到15樓，然後爬樓梯到30樓。為什麼？",
    true_need:
      "這個男人是侏儒症患者，身高很矮，搆不到30樓的按鈕，只能按到15樓。下雨天時可以用雨傘撐到30樓的按鈕。",
  },
  {
    title: "蒙臉的男子",
    content: "一個蒙臉的男人，拿著利器接近一個被綁在椅子上的女子，女子尖叫但男子想辦法讓他閉嘴了。旁邊還有一個女人冷冷地看著這一切。發生甚麼事了？",
    true_need:
      "戴面罩的男人是牙醫師，旁邊冷眼旁觀的是牙醫助理，尖銳的工具是洗牙機或電鑽。",
  },
  {
    title: "血糖App之謎",
    content:
      "某知名大醫院為了照顧高齡糖尿病患者，重金開發了一款「血糖超標警報 APP」。這款 APP 連接穿戴裝置，測量極度精準。上線第一週，門診的阿公、阿嬤們下載率高達 90%，但是到了第二週，後台發現幾乎所有的阿公都把 APP 刪除了",
    true_need:
      "這款 APP 在偵測到血糖超標時，為了怕長輩沒注意到，會發出非常大聲的「嗶嗶嗶」紅色警報音。阿嬤們的活動空間多在室內，或是和熟悉的姐妹淘聚會，不介意聊健康問題。但阿公們每天早上都習慣去公園跟老朋友下棋、泡茶、聊政治。一旦這個超大聲的警報在人群中響起，所有老朋友都會轉過頭來看他。這對愛面子的阿公來說，簡直像是「被公開廣播自己身體壞掉了、老了、沒用了」，這是一種嚴重的「社會性死亡」。所以他們寧願不要命，也要保住面子，毫不猶豫地把 APP 刪除。阿公們真正的 Need，不是「一個能大聲提醒他血糖過高的精準警報器」；而是「在絕對保全『老男人社交尊嚴與面子』的前提下，能夠『隱密且不著痕跡』地管理健康的方案」。",
  },
  {
    title: "密室之謎",
    content:
      "一個密室內有兩男四女，一個女生全裸，一個女生半裸，另外兩個女生及兩個男生都有穿衣服，全裸的女生在哭，其中一個男生則在竊笑，密室裡發生了甚麼?",
    true_need:
      "產房接生：裸體大哭的是女嬰、半裸笑的是媽媽、大哭的是爸爸、另外一男兩女是醫師護理師。",
  },
  {
    title: "哥哥懷孕了",
    content:
      "哥哥懷孕了，懷的是媽媽，發生甚麼事?",
    true_need:
      "哥哥很胖肚子很大，妹妹問他是懷孕嗎? 哥哥大怒回她: 懷妳媽啦!",
  },
];

export default function TeacherSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "custom">("select");
  const [selectedStory, setSelectedStory] = useState<(typeof DEMO_STORIES)[0] | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [customTrueNeed, setCustomTrueNeed] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const createRoom = async (
    title: string,
    content: string,
    trueNeed: string
  ) => {
    if (!title.trim() || !content.trim() || !trueNeed.trim()) {
      setError("請填寫所有欄位");
      return;
    }

    setCreating(true);
    setError("");

    // 生成唯一房間代碼
    let roomCode = generateRoomCode();
    let attempts = 0;

    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("room_code", roomCode)
        .single();

      if (!existing) break;
      roomCode = generateRoomCode();
      attempts++;
    }

    const { data, error: dbError } = await supabase
      .from("rooms")
      .insert({
        room_code: roomCode,
        story_title: title.trim(),
        story_content: content.trim(),
        true_need: trueNeed.trim(),
      })
      .select()
      .single();

    if (dbError || !data) {
      setError("建立房間失敗，請檢查 Supabase 連線設定");
      setCreating(false);
      return;
    }

    router.push(`/teacher/${roomCode}`);
  };

  return (
    <main className="min-h-screen cyber-grid-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-radial opacity-20 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* 標題 */}
        <div className="text-center mb-8">
          <div className="text-xs font-mono text-cyan-400 tracking-widest mb-2">TEACHER MODE</div>
          <h1 className="text-3xl font-black text-white">建立新遊戲</h1>
          <p className="text-slate-400 text-sm mt-1">選擇題目或自訂謎題</p>
        </div>

        {step === "select" && (
          <div className="space-y-4">
            {/* 預設題目 */}
            {DEMO_STORIES.map((story, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedStory(story);
                  createRoom(story.title, story.content, story.true_need);
                }}
                disabled={creating}
                className="w-full text-left cyber-card p-5 rounded-xl hover:glow-border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐢</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {story.title}
                    </div>
                    <div className="text-slate-400 text-sm mt-0.5 truncate">
                      {story.content.slice(0, 60)}...
                    </div>
                  </div>
                  <span className="text-slate-600 text-lg">→</span>
                </div>
              </button>
            ))}

            {/* 自訂題目 */}
            <button
              onClick={() => setStep("custom")}
              className="w-full cyber-card p-5 rounded-xl border border-dashed border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-200 hover:scale-[1.01] group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✏️</span>
                <div className="flex-1">
                  <div className="font-semibold text-cyan-400">自訂謎題</div>
                  <div className="text-slate-400 text-sm mt-0.5">輸入你自己的海龜湯題目</div>
                </div>
                <span className="text-slate-600 text-lg">→</span>
              </div>
            </button>
          </div>
        )}

        {step === "custom" && (
          <div className="cyber-card p-6 rounded-2xl space-y-4">
            <button
              onClick={() => setStep("select")}
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              ← 返回
            </button>

            <div>
              <label className="block text-sm font-mono text-slate-300 mb-1.5">
                謎題標題
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="例：神秘的死亡"
                className="w-full bg-[#0a0e1a] border border-[#1e3a5f] rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-slate-300 mb-1.5">
                湯面（表面現象）
              </label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="描述表面看到的現象，讓學生猜測背後原因..."
                rows={4}
                className="w-full bg-[#0a0e1a] border border-[#1e3a5f] rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-slate-300 mb-1.5">
                湯底（真相／True Need）
              </label>
              <textarea
                value={customTrueNeed}
                onChange={(e) => setCustomTrueNeed(e.target.value)}
                placeholder="完整的答案與背後真相..."
                rows={3}
                className="w-full bg-[#0a0e1a] border border-[#1e3a5f] rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-mono">{error}</p>
            )}

            <button
              onClick={() => createRoom(customTitle, customContent, customTrueNeed)}
              disabled={creating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "建立中..." : "🚀 建立房間並開始"}
            </button>
          </div>
        )}

        {creating && (
          <div className="text-center mt-6 text-cyan-400 font-mono text-sm animate-pulse">
            正在建立房間...
          </div>
        )}
      </div>
    </main>
  );
}

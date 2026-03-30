"use client";

interface StoryAreaProps {
  title: string;
  content: string;
}

export function StoryArea({ title, content }: StoryAreaProps) {
  return (
    <div className="cyber-card p-6 rounded-2xl glow-border">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-cyan-400 font-mono text-xs tracking-widest">🐢 湯面（表面現象）</span>
      </div>
      <h2 className="text-2xl font-black text-cyan-300 mb-3 text-glow">{title}</h2>
      <p className="text-white text-lg leading-relaxed font-medium">{content}</p>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Question, QuestionStatus } from "@/types";

export function useQuestions(roomId: string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    // 初始載入
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("room_id", roomId)
        .order("upvotes", { ascending: false })
        .order("created_at", { ascending: true });

      setQuestions(sortQuestions((data as Question[]) || []));
      setLoading(false);
    };

    fetchQuestions();

    // 訂閱：不加 filter，在 callback 裡做 client-side 過濾
    // 這是最穩定的做法，避免 Supabase Realtime filter 需要額外 DB 設定的問題
    const channel = supabase
      .channel(`questions-room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "questions" },
        (payload) => {
          const newQ = payload.new as Question;
          if (newQ.room_id !== roomId) return; // client-side 過濾
          setQuestions((prev) => {
            if (prev.find((q) => q.id === newQ.id)) return prev;
            return sortQuestions([...prev, newQ]);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "questions" },
        (payload) => {
          const updated = payload.new as Question;
          if (updated.room_id !== roomId) return;
          setQuestions((prev) =>
            sortQuestions(prev.map((q) => (q.id === updated.id ? updated : q)))
          );
        }
      )
      .subscribe((status) => {
        console.log("[useQuestions] Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const submitQuestion = useCallback(
    async (content: string, teamId: string, teamName: string): Promise<boolean> => {
      if (!roomId) return false;
      const { error } = await supabase.from("questions").insert({
        room_id: roomId,
        team_id: teamId,
        team_name: teamName,
        content: content.trim(),
      });
      if (error) console.error("[submitQuestion]", error);
      return !error;
    },
    [roomId]
  );

  const upvoteQuestion = useCallback(
    async (questionId: string, teamId: string): Promise<boolean> => {
      const { error } = await supabase.rpc("increment_upvote", {
        p_question_id: questionId,
        p_team_id: teamId,
      });
      if (error) console.error("[upvoteQuestion]", error);
      return !error;
    },
    []
  );

  const judgeQuestion = useCallback(
    async (questionId: string, status: QuestionStatus): Promise<boolean> => {
      const { error } = await supabase
        .from("questions")
        .update({ status })
        .eq("id", questionId);
      if (error) console.error("[judgeQuestion]", error);
      return !error;
    },
    []
  );

  return { questions, loading, submitQuestion, upvoteQuestion, judgeQuestion };
}

function sortQuestions(questions: Question[]): Question[] {
  const pending = questions
    .filter((q) => q.status === "pending")
    .sort((a, b) => b.upvotes - a.upvotes || a.created_at.localeCompare(b.created_at));

  const judged = questions
    .filter((q) => q.status !== "pending")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return [...pending, ...judged];
}

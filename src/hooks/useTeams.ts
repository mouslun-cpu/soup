"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Team } from "@/types";

export function useTeams(roomId: string | null) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchTeams = async () => {
      const { data } = await supabase
        .from("teams")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      setTeams((data as Team[]) || []);
      setLoading(false);
    };

    fetchTeams();

    const channel = supabase
      .channel(`teams:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "teams",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setTeams((prev) => {
            const newTeam = payload.new as Team;
            if (prev.find((t) => t.id === newTeam.id)) return prev;
            return [...prev, newTeam];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 加入或取得小組
  const joinOrCreateTeam = useCallback(
    async (
      roomId: string,
      teamName: string
    ): Promise<Team | null> => {
      // 先查是否已存在同名小組
      const { data: existing } = await supabase
        .from("teams")
        .select("*")
        .eq("room_id", roomId)
        .eq("team_name", teamName)
        .single();

      if (existing) return existing as Team;

      // 建立新小組
      const { data, error } = await supabase
        .from("teams")
        .insert({ room_id: roomId, team_name: teamName })
        .select()
        .single();

      if (error) return null;
      return data as Team;
    },
    []
  );

  return { teams, loading, joinOrCreateTeam };
}

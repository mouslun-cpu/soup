"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Room } from "@/types";

export function useRoom(roomCode: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const fetchRoom = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", roomCode.toUpperCase())
        .single();

      if (error) {
        setError("找不到此房間");
      } else {
        setRoom(data as Room);
      }
      setLoading(false);
    };

    fetchRoom();

    // 同樣不加 filter，callback 裡做 client-side 過濾
    const channel = supabase
      .channel(`rooms-watch-${roomCode}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms" },
        (payload) => {
          const updated = payload.new as Room;
          if (updated.room_code !== roomCode.toUpperCase()) return;
          setRoom(updated);
        }
      )
      .subscribe((status) => {
        console.log("[useRoom] Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  return { room, loading, error };
}

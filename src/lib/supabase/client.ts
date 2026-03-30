import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

// 直接初始化，避免 Proxy 造成 Realtime this 綁定問題
export const supabase = createClient(url, key, {
  realtime: {
    params: {
      eventsPerSecond: 20,
    },
  },
});

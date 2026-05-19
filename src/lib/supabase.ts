import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// 서버 전용. service_role 키 사용 — RLS 우회.
export function getServiceClient() {
  return createClient(env.supabaseUrl(), env.supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

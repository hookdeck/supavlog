// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  // @ts-ignore
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL"),
  // @ts-ignore
  Deno.env.get("X_SUPABASE_API_SECRET")
);

export default supabase;

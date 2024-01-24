import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("NEXT_PUBLIC_SUPABASE_URL"),
  Deno.env.get("X_SUPABASE_API_SECRET")
);

export default supabase;

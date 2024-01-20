import { cookies } from "next/headers";
import LinkButton from "./LinkButton";
import { createClient } from "@/utils/supabase/server";

export default async function RecordAVlogButtonSection() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col w-full items-center">
      <LinkButton arrow="right" href="/vlogs/new">
        🎥 Record a new Vlog{" "}
      </LinkButton>
    </div>
  );
}

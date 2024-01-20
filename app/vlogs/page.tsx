import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RecordingsList from "@/components/VlogList";
import LinkButton from "@/components/LinkButton";

export default async function RecordNew() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }
  return (
    <div className="flex-1 flex flex-col w-full gap-10">
      <div className="w-full">
        <LinkButton arrow="left" href="/">
          Home
        </LinkButton>
      </div>
      <div className="flex-1 flex flex-col w-full items-center">
        <LinkButton arrow="right" href="/vlogs/new">
          🎥 Record a new Vlog{" "}
        </LinkButton>
      </div>
      <div className="flex-1 flex flex-col w-full justify-center gap-10">
        <h2 className="text-2xl text-center">Vlogs</h2>
        <RecordingsList />
      </div>
    </div>
  );
}

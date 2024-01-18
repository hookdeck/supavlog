import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RecordingsList from "@/components/RecordingsList";
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
        <LinkButton arrow="right" href="/recordings/new">
          🎥 Record a new video{" "}
        </LinkButton>
      </div>
      <div className="flex-1 flex flex-col w-full justify-center gap-10">
        <h2 className="text-2xl">Existing recordings</h2>
        <RecordingsList userId={user.id} />
      </div>
    </div>
  );
}

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import RecordingsList from "@/components/VlogList";
import LinkButton from "@/components/LinkButton";
import { notFound } from "next/navigation";
import NavSection from "@/components/NavSection";

export default async function VlogByUsername({
  params,
}: {
  params: { username: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", params.username);

  if (result.status !== 200 || !result.data) {
    return notFound();
  }

  const userId = result.data[0].user_id;
  const navOverride: Record<string, string> = {};
  navOverride[`/vlogs/${params.username}`] = params.username;

  return (
    <div className="flex-1 flex flex-col w-full gap-10">
      <NavSection structureOverride={navOverride} />
      <div className="flex-1 flex flex-col w-full items-center">
        <LinkButton arrow="right" href="/vlogs/new">
          🎥 Record a new Vlog{" "}
        </LinkButton>
      </div>
      <div className="flex-1 flex flex-col w-full justify-center gap-10">
        <h2 className="text-2xl text-center">
          Vlogs by {params.username} {(user && user.id) === userId && "(you)"}
        </h2>
        <RecordingsList userId={userId} />
      </div>
    </div>
  );
}

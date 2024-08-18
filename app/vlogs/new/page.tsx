import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RecordVlog from "@/components/RecordVlog";
import { getClient } from "@/utils/stream/server";
import Breadcrumb from "@/components/Breadcrumb";

const serverClient = getClient();

export default async function RecordNew() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // exp is optional (by default the token is valid for an hour)
  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  const token = serverClient.createToken(user.id, exp);

  return (
    <div className="flex-1 flex flex-col w-full justify-center gap-10">
      <Breadcrumb />
      <div className="flex-1 flex flex-col w-full gap-2 justify-center items-center">
        <h2 className="text-xl">Record a new Vlog</h2>
        <RecordVlog
          userId={user.id}
          userName={user.user_metadata.username}
          token={token}
        />
      </div>
    </div>
  );
}

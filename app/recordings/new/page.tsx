import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RecordVideo from "@/components/RecordVideo";
import { StreamClient } from "@stream-io/node-sdk";
import { useCallback, useState } from "react";
import { CallRecording, useCall } from "@stream-io/video-react-sdk";
import LinkButton from "@/components/LinkButton";

const serverClient = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export default async function RecordNew() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
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
      <div className="w-full gap-2">
        <LinkButton arrow="left" href="/recordings">
          Back
        </LinkButton>
      </div>
      <div className="flex-1 flex flex-col w-full gap-2 justify-center items-center">
        <h2 className="text-xl">Record a new video</h2>
        <RecordVideo userId={user.id} userName={user.email!} token={token} />
      </div>
    </div>
  );
}

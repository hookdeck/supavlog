import type { Metadata, ResolvingMetadata } from "next";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { VlogItem } from "@/types/VlogItem";
import { getClient } from "@/utils/stream/server";
import RecordAVlogButtonSection from "@/components/RecordAVlogButtonSection";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import DeleteVlogButton from "@/components/DeleteVlogButton";

const serverClient = getClient();

const getVlogFromStream = async (vlogId: string): Promise<VlogItem | null> => {
  const callId = vlogId.substring(0, vlogId.lastIndexOf("-"));
  const recordingIndex = vlogId.substring(vlogId.lastIndexOf("-") + 1);
  if (!callId || !recordingIndex) {
    throw new Error("Invalid Vlog ID");
  }

  let vlog: VlogItem | null = null;

  const response = await serverClient.video.queryCalls({
    filter_conditions: {
      id: { $eq: callId },
    },
  });

  if (response.calls.length > 0) {
    const callReponses = response?.calls;
    const callResponse = callReponses[0];
    const call = serverClient.video.call("default", callResponse.call.id);
    const recordingsResponse = await call.listRecordings();
    const recording = recordingsResponse.recordings[parseInt(recordingIndex)];

    if (recording) {
      vlog = {
        id: vlogId,
        url: recording.url,
        filename: recording.filename,
        end_time: recording.end_time,
        title: callResponse.call.custom.title,
        by_username: callResponse.call.created_by.name!,
        by_user_id: callResponse.call.created_by.id,
      };
    }
  }

  return vlog;
};

const getVlogFromSupabase = async (
  vlogId: string
): Promise<VlogItem | null> => {
  let vlog: VlogItem | null = null;

  // TODO: can we reduce the duplication of creating two Supabase clients?
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const joinQuery =
    "user_id, url, thumbnail_url, created_at, title, profiles(username)";
  const { data, error } = await supabase
    .from("videos")
    .select(joinQuery)
    .eq("id", vlogId);

  if (error) {
    console.log(error);
    throw new Error("Could not get vlog from supabase");
  }

  if (data?.length > 0) {
    const recording = data[0];
    vlog = {
      id: vlogId,
      url: recording.url,
      thumbnail_url: recording.thumbnail_url,
      filename: recording.url
        ? recording.url.substring(recording.url.lastIndexOf("/") + 1)
        : null,
      end_time: recording.created_at,
      title: recording.title,
      // @ts-ignore
      by_username: recording.profiles.username,
      by_user_id: recording.user_id,
    };
  }

  return vlog;
};

const getVlog = async (vlogId: string): Promise<VlogItem | null> => {
  const vlog =
    process.env.VIDEO_STORAGE_PLATFORM === "stream"
      ? await getVlogFromStream(vlogId)
      : await getVlogFromSupabase(vlogId);

  return vlog;
};

type Props = { params: { vlog_id: string } };

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const vlog = await getVlog(params.vlog_id);

  const title = `${vlog?.title} - ${vlog?.by_username} | SupaVlog`;

  return {
    title,
    description: vlog?.description ? `${vlog?.description} | SupaVlog` : title,
    openGraph: {
      images: vlog?.thumbnail_url,
      authors: vlog?.by_username,
    },
  };
}

export default async function SingleVlog({ params }: Props) {
  const vlog = await getVlog(params.vlog_id);

  const navOverride: Record<string, string> = {};
  navOverride[`/vlogs/${vlog?.by_username}`] =
    vlog?.by_username || "Unknown user";
  navOverride[`/vlogs/${vlog?.by_username}/${vlog?.id}`] =
    vlog?.title || "No title available";

  // TODO: can we reduce the duplication of creating two Supabase clients?
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const currentUser = await supabase.auth.getUser();

  return (
    <div className="flex-1 flex flex-col w-full gap-10">
      <Breadcrumb structureOverride={navOverride} />
      {!vlog ? (
        notFound()
      ) : (
        <>
          <RecordAVlogButtonSection />
          <div className="flex-1 flex flex-col w-full justify-center gap-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl text-center">
                {vlog.title || "No title available"}
              </h2>
              <h3 className="text-lg text-center">
                By{" "}
                {vlog.by_username ? (
                  <Link href={`/vlogs/${vlog.by_username}`}>
                    {vlog.by_username}
                  </Link>
                ) : (
                  "Unknown user"
                )}
              </h3>
            </div>
            {vlog.url ? (
              <video controls>
                <source src={vlog.url} type="video/mp4" />
              </video>
            ) : (
              <div className="flex flex-col justify-center items-center">
                <p>Video is still processing...</p>
              </div>
            )}

            <span>{new Date(vlog.end_time).toLocaleString()}</span>
          </div>
          {currentUser.data.user?.id === vlog.by_user_id && (
            <div className="flex-1 flex flex-col w-full justify-center gap-10">
              <DeleteVlogButton vlogId={vlog.id} username={vlog.by_username} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

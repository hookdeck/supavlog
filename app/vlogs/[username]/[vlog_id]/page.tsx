import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import RecordingsList from "@/components/VlogList";
import LinkButton from "@/components/LinkButton";
import { notFound } from "next/navigation";
import { VlogItem } from "@/types/DisplayedRecording";
import { getClient } from "@/utils/stream/server";
import RecordAVlogButtonSection from "@/components/RecordAVlogButtonSection";

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

  console.log(response);

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
      };
    }
  }

  return vlog;
};

const getVlogFromSupabase = async (
  vlogId: string
): Promise<VlogItem | null> => {
  let vlog: VlogItem | null = null;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const joinQuery = "url, created_at, title, profiles(username)";
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
      filename: recording.url.substring(recording.url.lastIndexOf("/") + 1),
      end_time: recording.created_at,
      title: recording.title,
      // @ts-ignore
      by_username: recording.profiles.username,
    };
  }

  return vlog;
};

export default async function SingleVlog({
  params,
}: {
  params: { vlog_id: string };
}) {
  const vlog =
    process.env.VIDEO_STORAGE_PLATFORM === "stream"
      ? await getVlogFromStream(params.vlog_id)
      : await getVlogFromSupabase(params.vlog_id);

  return (
    <div className="flex-1 flex flex-col w-full gap-10">
      <div className="w-full">
        <LinkButton arrow="left" href="/">
          Home
        </LinkButton>
      </div>
      {!vlog ? (
        notFound()
      ) : (
        <>
          <RecordAVlogButtonSection />
          <div className="flex-1 flex flex-col w-full justify-center gap-10">
            <h2 className="text-2xl text-center">
              {vlog.title || "No title available"}
            </h2>
            <video controls>
              <source src={vlog.url} type="video/mp4" />
            </video>
            <span>{new Date(vlog.end_time).toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
}

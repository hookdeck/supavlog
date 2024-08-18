import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { VlogItem } from "@/types/VlogItem";
import { getClient } from "@/utils/stream/server";

const serverClient = getClient();

const getRecordingsFromStream = async (userId?: string) => {
  let recordings: VlogItem[] = [];

  const response = await (async (_userId?: string) => {
    if (_userId) {
      return await serverClient.video.queryCalls({
        filter_conditions: {
          created_by_user_id: { $eq: _userId },
        },
      });
    } else {
      return await serverClient.video.queryCalls();
    }
  })(userId);

  const callReponses = response?.calls;
  for (let i = 0; i < callReponses?.length; ++i) {
    const response = callReponses[i];
    const call = serverClient.video.call("default", response.call.id);
    const recordingsResponse = await call.listRecordings();
    recordings = recordings.concat(
      recordingsResponse.recordings.map((recording, index) => ({
        id: `${response.call.id}-${index}`, // index is used to identify the recording
        url: recording.url,
        thumbnail_url: response.call.thumbnails?.image_url,
        filename: recording.filename,
        end_time: recording.end_time,
        title: response.call.custom.title,
        by_username: response.call.created_by.name!,
        by_user_id: response.call.created_by.id,
      }))
    );
  }

  return recordings;
};

const getRecordingsFromSupabase = async (userId?: string) => {
  // TODO: can we reduce the duplication of creating two Supabase clients?
  const supabase = createClient();

  const { data, error } = await (async (userId?: string) => {
    const joinQuery =
      "id, user_id, url, thumbnail_url, created_at, title, profiles(username)";
    if (userId) {
      return await supabase
        .from("videos")
        .select(joinQuery)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    } else {
      return await supabase
        .from("videos")
        .select(joinQuery)
        .order("created_at", { ascending: false });
    }
  })(userId);

  const recordings: VlogItem[] = [];
  if (error) {
    // TODO: change the logic here to handle the error
    console.error("arg!", error);
    return recordings;
  }

  data.forEach((video) => {
    recordings.push({
      id: video.id,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      filename: video.url
        ? video.url.substring(video.url.lastIndexOf("/") + 1)
        : null,
      end_time: video.created_at,
      title: video.title,
      //@ts-ignore (TODO: update type definitions to correct reflect result structure)
      by_username: video.profiles.username,
      by_user_id: video.user_id,
    });
  });

  return recordings;
};

export default async function RecordingsList({ userId }: { userId?: string }) {
  // TODO: can we reduce the duplication of creating two Supabase clients?
  const supabase = createClient();
  const currentUser = await supabase.auth.getUser();

  let recordings =
    process.env.VIDEO_STORAGE_PLATFORM === "stream"
      ? await getRecordingsFromStream(userId)
      : await getRecordingsFromSupabase(userId);

  const MAX_TITLE_LENGTH = 60;
  const reduceTitle = (title: string) => {
    if (title.length > MAX_TITLE_LENGTH) {
      return `${title.substring(0, MAX_TITLE_LENGTH)}...`;
    }
    return title;
  };

  return (
    <div title="Recordings">
      {!recordings && (
        <div>
          <p>No recordings found...</p>
        </div>
      )}

      {recordings.length > 0 && (
        <ul className="w-full flex flex-wrap justify-center gap-10">
          {recordings.map((recording, index) => {
            // Allow the owner of the video to navigate to a video that is still processing
            // or has potentially failed to process.
            let recordingUrl = `/vlogs/${recording.by_username}/${recording.id}`;
            if (
              recording.url === null &&
              recording.by_user_id !== currentUser.data.user?.id
            ) {
              recordingUrl = "#";
            }
            return (
              <li
                className="rounded-md border-solid border-2 p-4 border-slate-700 w-[350px] hover:border-slate-900 hover:bg-slate-950"
                key={`recording-${index}`}
              >
                <a
                  role="button"
                  href={recordingUrl}
                  title={recording.title}
                  className="group flex flex-col gap-4 items-center text-center bg-cover bg-no-repeat bg-center rounded-md group-hover:0 relative"
                  style={
                    recording.thumbnail_url
                      ? {
                          backgroundImage: `url(${recording.thumbnail_url})`,
                        }
                      : {}
                  }
                >
                  <h3
                    className="text-lg whitespace-pre-wrap h-[50px]"
                    title={recording.title}
                  >
                    {recording.title
                      ? reduceTitle(recording.title)
                      : "No title available"}
                  </h3>
                  {!recording.url && (
                    <div className="absolute flex flex-col justify-center h-full z-20">
                      <span>Video not available or still processing</span>
                    </div>
                  )}
                  <div className="flex justify-center relative w-full h-[100px] z-1 opacity-0 group-hover:opacity-50">
                    <Image
                      className="absolute z-10"
                      src={"/icons/video.svg"}
                      alt={`Pleaseholder video image for ${recording.title}`}
                      width={100}
                      height={100}
                    />
                  </div>

                  <div className="h-[50px]">
                    <h4 className="text-md">{recording.by_username}</h4>
                    <span className="text-xs flex items-end">
                      <span>
                        {new Date(recording.end_time).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

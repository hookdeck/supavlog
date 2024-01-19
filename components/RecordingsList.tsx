import Image from "next/image";
import { StreamClient } from "@stream-io/node-sdk";
import { createClient as createClientUtil } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type DisplayedRecording = {
  url: string;
  filename: string;
  end_time: string;
  title: string;
};

const serverClient = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

const getRecordingsFromStream = async (userId: string) => {
  let recordings: DisplayedRecording[] = [];

  const response = await serverClient.video.queryCalls({
    filter_conditions: {
      created_by_user_id: { $eq: userId },
    },
  });

  const callReponses = response?.calls;
  for (let i = 0; i < callReponses?.length; ++i) {
    const response = callReponses[i];
    const call = serverClient.video.call("default", response.call.id);
    const recordingsResponse = await call.listRecordings();
    recordings = recordings.concat(
      recordingsResponse.recordings.map((recording) => ({
        url: recording.url,
        filename: recording.filename,
        end_time: recording.end_time,
        title: response.call.custom.title,
      }))
    );
  }

  return recordings;
};

const getRecordingsFromSupabase = async (userId: string) => {
  const cookieStore = cookies();
  const supabase = createClientUtil(cookieStore);

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", userId);

  const recordings: DisplayedRecording[] = [];
  if (error) {
    // TODO: change the logic here to handle the error
    console.error(error);
    return recordings;
  }

  data.forEach((video) => {
    recordings.push({
      url: video.url,
      filename: video.url.substring(video.url.lastIndexOf("/") + 1),
      end_time: video.created_at,
      title: video.title,
    });
  });

  return recordings;
};

export default async function RecordingsList({ userId }: { userId: string }) {
  let recordings = await getRecordingsFromStream(userId);
  // let recordings = await getRecordingsFromSupabase(userId);

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
          {recordings.map((recording, index) => (
            <li
              className="rounded-md border-solid border-2 p-4 border-slate-700 w-[350px] hover:border-slate-900 hover:bg-slate-950"
              key={`recording-${index}`}
            >
              <a
                role="button"
                href={recording.url}
                download={recording.filename}
                title="Download the recording"
                className="flex flex-col gap-4 items-center text-center"
              >
                <h3
                  className="text-lg whitespace-pre-wrap h-[50px]"
                  title={recording.title}
                >
                  {recording.title
                    ? reduceTitle(recording.title)
                    : "No title available"}
                </h3>
                <Image
                  src="/icons/video.svg"
                  alt={`Video image for ${recording.title}`}
                  width={100}
                  height={100}
                />
                <span className="text-xs flex items-end h-[50px]">
                  <span>{new Date(recording.end_time).toLocaleString()}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

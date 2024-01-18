import { StreamClient, VideoCallRecording } from "@stream-io/node-sdk";

const serverClient = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export default async function RecordingsList({ userId }: { userId: string }) {
  const response = await serverClient.video.queryCalls({
    filter_conditions: {
      created_by_user_id: { $eq: userId },
    },
  });
  let recordings: VideoCallRecording[] = [];
  const callReponses = response?.calls;
  for (let i = 0; i < callReponses?.length; ++i) {
    const response = callReponses[i];
    const call = serverClient.video.call("default", response.call.id);
    const recordingsResponse = await call.listRecordings();
    recordings = recordings.concat(recordingsResponse.recordings);
  }

  return (
    <div title="Recordings">
      {!recordings && (
        <div>
          <p>No recordings found...</p>
        </div>
      )}

      {response && recordings.length > 0 && (
        <ul>
          {recordings.map((recording, index) => (
            <li key={`recording-${index}`}>
              <a
                role="button"
                href={recording.url}
                download={recording.filename}
                title="Download the recording"
              >
                {new Date(recording.end_time).toLocaleString()}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

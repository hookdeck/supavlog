"use client";

import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import {
  Call,
  CallingState,
  LoadingIndicator,
  RecordCallButton,
  ScreenShareButton,
  SpeakerLayout,
  SpeakingWhileMutedNotification,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  useCall,
  useCallStateHooks,
  User,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import Button from "./Button";
import { createClient } from "@/utils/supabase/client";

export default function RecordVideo({
  userId,
  userName,
  token,
}: {
  userId: string;
  userName: string;
  token: string;
}) {
  const streamUser: User = {
    id: userId,
    name: userName,
    image: `https://getstream.io/random_svg/?id=${userId}}&name=${userName}`,
  };

  const [client, setVideoClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const _client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: streamUser,
      token,
    });
    setVideoClient(_client);

    return () => {
      _client
        .disconnectUser()
        .catch((e) => console.error(`Couldn't disconnect user`, e));
      setVideoClient(undefined);
    };
  }, []);

  if (!client) {
    return <div>Loading...</div>;
  }

  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const title = e.target.value;
    setTitle(title);
  };

  const handleRecordingStopping = async () => {
    const supabase = createClient();

    // Ensure this has completed before ending the call.
    // This ensures that the video exists within the DB before
    // the call.recording_ready are triggered and received.
    const { error } = await supabase.from("videos").insert({
      user_id: streamUser.id, // uses same user_id as supabase
      profile_user_id: streamUser.id,
      title: title,
      call_id: call!.id,
    });
    if (error) {
      console.error(error);
    }
  };

  const startCall = () => {
    if (call) {
      console.warn("Call already started");
      return;
    }

    const myCall = client.call("default", "call_" + userId + "_" + Date.now());

    myCall.on("call.recording_stopped", async () => {
      // Only allow one recording per call
      // This is to work around a known issue with stream where
      // the call.recording* events do not contain any information
      // about the creator of the call.

      myCall.leave().catch((err) => {
        console.error(`Failed to leave the call`, err);
      });

      myCall.endCall().catch((err) => {
        console.error(`Failed to end the call`, err);
      });

      setCall(undefined);
      setTitle("");
    });

    myCall
      .join({
        create: true,
        data: {
          custom: {
            title,
          },
        },
      })
      .catch((err) => {
        console.error(`Failed to join the call`, err);
      });

    setCall(myCall);
  };

  if (call) {
    return (
      <div className="animate-in flex flex-col gap-4 min-h-[400px]">
        <h2>{title.trim()}</h2>
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <UILayout onRecordingStopping={handleRecordingStopping} />
          </StreamCall>
        </StreamVideo>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-4 items-center min-h-[400px]">
        <input
          type="text"
          placeholder="Vlog title"
          onChange={handleTitleChange}
          value={title}
          className="text-black w-[400px] border-rounded rounded-md p-4"
        />
        <Button
          onClick={startCall}
          disabled={title.length < 3}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Vlog
        </Button>
      </div>
    );
  }
}

export const UILayout = ({
  onRecordingStopping,
}: {
  onRecordingStopping: RecordingStoppingHandler;
}) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState: CallingState = useCallCallingState();
  if (
    callingState !== CallingState.JOINED &&
    callingState !== CallingState.LEFT
  ) {
    return <div>Loading...</div>;
  } else if (callingState === CallingState.LEFT) {
    return <div>Call has ended</div>;
  }

  return (
    <StreamTheme className="flex flex-col min-w-[400px]">
      <SpeakerLayout participantsBarPosition="bottom" />
      <div className="str-video__call-controls">
        {/* <RecordCallButton /> */}
        <CustomRecordCallButton
          onRecordingStopping={async () => {
            await onRecordingStopping();
          }}
        />
        <SpeakingWhileMutedNotification>
          <ToggleAudioPublishingButton />
        </SpeakingWhileMutedNotification>
        <ToggleVideoPublishingButton />
        <ScreenShareButton />
        {/* <CustomCancelCallButton /> */}
      </div>
    </StreamTheme>
  );
};

// Commented out due to the one call per recording restriction put
// in place by call.recording_ready restriction.
// type CustomCancelCallButtonProps = {
//   reject?: boolean;
// };

// export const CustomCancelCallButton = ({
//   reject,
// }: CustomCancelCallButtonProps) => {
//   const call = useCall();
//   return (
//     <div className="str-video__composite-button">
//       <Button
//         onClick={() => call?.leave({ reject })}
//         className="h-[38px] text-center text-white text-xl"
//       >
//         ⬜️
//       </Button>
//       <div className="str-video__composite-button__caption">Stop</div>
//     </div>
//   );
// };

type RecordingStoppingHandler = () => Promise<void>;

export const CustomRecordCallButton = ({
  onRecordingStopping,
}: {
  onRecordingStopping: RecordingStoppingHandler;
}) => {
  const call = useCall();
  const { useIsCallRecordingInProgress } = useCallStateHooks();

  const isCallRecordingInProgress = useIsCallRecordingInProgress();
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  useEffect(() => {
    // we wait until call.recording_started/stopped event to flips the
    // `isCallRecordingInProgress` state variable.
    // Once the flip happens, we remove the loading indicator
    setIsAwaitingResponse((isAwaiting) => {
      if (isAwaiting) return false;
      return isAwaiting;
    });
  }, [isCallRecordingInProgress]);

  const toggleRecording = useCallback(async () => {
    try {
      setIsAwaitingResponse(true);
      if (isCallRecordingInProgress) {
        await onRecordingStopping();
        await call?.stopRecording();
      } else {
        await call?.startRecording();
      }
    } catch (e) {
      console.error(`Failed start recording`, e);
    }
  }, [call, isCallRecordingInProgress]);

  return (
    <div className="str-video__composite-button">
      {isAwaitingResponse ? (
        <>
          <Button>
            <LoadingIndicator
              tooltip={
                isCallRecordingInProgress
                  ? "Waiting for recording to stop... "
                  : "Waiting for recording to start..."
              }
            />
          </Button>
        </>
      ) : (
        <>
          <Button
            disabled={!call}
            title="Record call"
            onClick={toggleRecording}
          >
            {isCallRecordingInProgress ? <span>🔴</span> : <span>⚪</span>}
          </Button>
          <div className="str-video__composite-button__caption">
            {isCallRecordingInProgress ? <span>Stop</span> : <span>Start</span>}
          </div>
        </>
      )}
    </div>
  );
};

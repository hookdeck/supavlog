"use client";

import { ChangeEventHandler, useEffect, useState } from "react";
import {
  Call,
  CallingState,
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

export default function RecordVideo({
  userId,
  userName,
  token,
}: {
  userId: string;
  userName: string;
  token: string;
}) {
  if (typeof window === "undefined") return;

  const user: User = {
    id: userId,
    name: userName,
    image: `https://getstream.io/random_svg/?id=${userId}}&name=${userName}`,
  };

  const [client, setVideoClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [title, setTitle] = useState<string>("");
  const [callId, setCallId] = useState<string>("");

  useEffect(() => {
    const _client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user,
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
    // Reuse the same call for a user for the time being. This means that all recordings
    // will be associated with the same call. This is fine for now, but we may want to
    // change this in the future.
    const callId = "call_" + userId;
    setCallId(callId);
  };

  const startCall = () => {
    if (call) {
      console.warn("Call already started");
      return;
    }

    const myCall = client.call("default", callId);
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

  const endCall = () => {
    if (!call) {
      console.warn("Call not started or already ended");
      return;
    }

    call.stopRecording().catch((err) => {
      console.warn(`Failed to stop recording`, err);
    });

    call.leave().catch((err) => {
      console.error(`Failed to leave the call`, err);
    });

    call.endCall().catch((err) => {
      console.error(`Failed to end the call`, err);
    });

    setCall(undefined);
    setCallId("");
    setTitle("");
  };

  if (call) {
    return (
      <div className="animate-in flex flex-col gap-4">
        <h2>{title.trim()}</h2>
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <UILayout onLeave={endCall} />
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
          className={callId.length < 3 ? "invisible" : "visible"}
        >
          Start Video
        </Button>
      </div>
    );
  }
}

export const UILayout = ({ onLeave }: { onLeave: () => void }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState: CallingState = useCallCallingState();
  if (
    callingState !== CallingState.JOINED &&
    callingState !== CallingState.LEFT
  ) {
    return <div>Loading...</div>;
  } else if (callingState === CallingState.LEFT) {
    onLeave();
    return <div>Call has ended</div>;
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <div className="str-video__call-controls">
        <RecordCallButton />
        <SpeakingWhileMutedNotification>
          <ToggleAudioPublishingButton />
        </SpeakingWhileMutedNotification>
        <ToggleVideoPublishingButton />
        <ScreenShareButton />
        <CustomCancelCallButton />
      </div>
    </StreamTheme>
  );
};

type CustomCancelCallButtonProps = {
  reject?: boolean;
};

export const CustomCancelCallButton = ({
  reject,
}: CustomCancelCallButtonProps) => {
  const call = useCall();
  return (
    <div className="str-video__composite-button">
      <Button
        onClick={() => call?.leave({ reject })}
        className="h-[38px] text-center text-white text-xl"
      >
        ⬜️
      </Button>
      <div className="str-video__composite-button__caption">Stop</div>
    </div>
  );
};

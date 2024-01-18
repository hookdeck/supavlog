"use client";

import { useEffect, useState } from "react";
import {
  Call,
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
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

  const client = new StreamVideoClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    user,
    token,
  });

  const [call, setCall] = useState<Call>();
  const [callId, setCallId] = useState<string>("");

  const startCall = () => {
    if (call) {
      console.warn("Call already started");
      return;
    }

    const myCall = client.call("default", callId);
    myCall.join({ create: true }).catch((err) => {
      console.error(`Failed to join the call`, err);
    });

    setCall(myCall);
  };

  const endCall = () => {
    if (!call) {
      console.warn("Call not started or already ended");
      return;
    }
    call.leave().catch((err) => {
      console.error(`Failed to leave the call`, err);
    });
    call.endCall().catch((err) => {
      console.error(`Failed to end the call`, err);
    });
    setCall(undefined);
  };

  if (call) {
    return (
      <>
        <h2>{callId}</h2>
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <UILayout onLeave={endCall} />
          </StreamCall>
        </StreamVideo>
      </>
    );
  } else {
    return (
      <div className="flex flex-row gap-2">
        <input
          type="text"
          placeholder="Call ID"
          onChange={(e) => setCallId(e.target.value)}
          value={callId}
          className="text-black"
        />
        {callId.length > 3 && <Button onClick={startCall}>Start Call</Button>}
      </div>
    );
  }
}

export const UILayout = ({ onLeave }: { onLeave: () => void }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  if (
    callingState !== CallingState.JOINED &&
    callingState !== CallingState.LEFT
  ) {
    return <div>Loading...</div>;
  } else if (callingState === CallingState.LEFT) {
    return <div>Call has ended</div>;
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls onLeave={onLeave} />
    </StreamTheme>
  );
};

import supabase from "../_shared/supabaseClient.ts";
import { uploadToBucket, getCallDetails } from "../_shared/utils.ts";

interface Body {
  type: string;
  created_at: string;
  call_cid: string;
  call: Call;
  user: Createdby;
}
interface Call {
  type: string;
  id: string;
  cid: string;
  current_session_id: string;
  created_by: Createdby;
  created_at: string;
  updated_at: string;
  recording: boolean;
  transcribing: boolean;
  ended_at: string;
  starts_at?: any;
  blocked_user_ids: any[];
  thumbnails: Thumbnails;
}
interface Thumbnails {
  image_url: string;
}

interface Createdby {
  id: string;
  name: string;
  image: string;
  language: string;
  role: string;
  teams: any[];
  created_at: string;
  updated_at: string;
}

const VIDEO_TABLE = "videos";

const updateVideoDetails = async ({
  callId,
  publicUrl,
}: {
  callId: string;
  publicUrl: string;
}) => {
  console.log(`Updating thumbnail with call ID "${callId}"`);

  let videoUpdateResult = await supabase
    .from(VIDEO_TABLE)
    .update({
      thumbnail_url: publicUrl,
    })
    .eq("call_id", callId);

  console.log({ videoUpdateResult });

  if (videoUpdateResult.error) {
    console.error("Error updating video in database", videoUpdateResult.error);
    throw new Error("Error updating video in database");
  }

  return videoUpdateResult.data;
};

const getStreamUrl = (body: Body) => {
  return decodeURI(body.call.thumbnails.image_url);
};

const getStreamFilename = (body: Body, userId: string) => {
  let filename = `${Date.now()}-`;
  filename += "thumbnail.jpg";
  return filename;
};

const WEBHOOK_EVENTS = ["call.ended"];

Deno.serve(async (req) => {
  const body: Body = await req.json();

  if (WEBHOOK_EVENTS.includes(body.type) === false) {
    console.log("not a call recording, skipping");
    return new Response(
      JSON.stringify({
        success: false,
        message: "Was not a call.recording_ready type event",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  console.log("processing webook", { body });

  try {
    const fileType = "jpg";

    let streamUrl = getStreamUrl(body);
    console.log("requesting stream url", streamUrl);

    const { callId, userId } = getCallDetails(body.call_cid);

    const streamFilename = getStreamFilename(body, userId);

    const download = await fetch(streamUrl);
    console.log(`Downloaded ${fileType}`);
    if (download.status !== 200) {
      console.error(
        `Error downloading ${fileType}`,
        download.status,
        download.statusText
      );
      throw new Error(`Error downloading ${fileType}`);
    }

    const buffer = await download.arrayBuffer();

    const uploadFilePath = `${userId}/${streamFilename}`;

    const { publicUrl } = await uploadToBucket({
      uploadFilePath,
      userId,
      buffer,
    });

    await updateVideoDetails({ callId, publicUrl });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("Catch all in webhook handler", e);
    return new Response(JSON.stringify({ success: false }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

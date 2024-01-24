import supabase from "../_shared/supabaseClient.ts";
import { getCallDetails, uploadToBucket } from "../_shared/utils.ts";

interface Body {
  type: string;
  created_at: string;
  call_cid: string;
  call_recording: Callrecording;
}
interface Callrecording {
  filename: string;
  url: string;
  start_time: string;
  end_time: string;
}

const VIDEO_TABLE = "videos";

const updateVideoDetails = async ({
  callId,
  publicUrl,
}: {
  callId: string;
  publicUrl: string;
}) => {
  // TODO: see above comment on the user ID. We also don't presently
  // get the call title so can't add this here yet. Update when that
  // info becomes available via the webhook payload.

  // Insert
  // const videoInsertResult = await supabase.from(VIDEO_TABLE).insert({
  //   user_id: userId,
  //   title: "",
  //   description: "",
  //   url: publicUrl,
  //   profile_user_id: userId,
  // });

  // Update
  console.log(`Updating video with call ID "${callId}"`);

  let videoUpdateResult = await supabase
    .from(VIDEO_TABLE)
    .update({
      url: publicUrl,
    })
    .eq("call_id", callId);

  console.log({ videoUpdateResult });

  if (videoUpdateResult.error) {
    // Insert
    // console.error("Error adding video to database", videoInsertResult.error);
    // throw new Error("Error adding video to database");

    // Update
    console.error("Error updating video in database", videoUpdateResult.error);
    throw new Error("Error updating video in database");
  }

  return videoUpdateResult.data;
};

const getStreamUrl = (body: Body) => {
  return decodeURI(body.call_recording.url);
};

const getStreamFilename = (body: Body, userId: string) => {
  let filename = `${Date.now()}-`;
  filename += body.call_recording.filename.replace(userId, "");

  return filename;
};

const WEBHOOK_EVENTS = ["call.recording_ready"];

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
    const fileType = "mp4";

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
      fileType,
      uploadFilePath,
      userId,
      buffer,
    });

    await updateVideoDetails({ callId, publicUrl });

    // Insert
    // return new Response(JSON.stringify({ success: true }), {
    //   headers: { "Content-Type": "application/json" },
    //   status: 201,
    // });

    // Update
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

import supabase from "./supabaseClient.ts";

const VIDEO_BUCKET = "videos";

// Upload file using standard upload
async function uploadFile(filePath: string, file: ArrayBuffer) {
  const result = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(filePath, file);
  if (result.error) {
    console.error(result.error);
    throw result.error;
  }
}

export const uploadToBucket = async ({
  uploadFilePath,
  userId,
  buffer,
}: {
  uploadFilePath: string;
  userId: string;
  buffer: ArrayBuffer;
}) => {
  console.log(`Uploading ${uploadFilePath} for user ${userId}`);

  await uploadFile(uploadFilePath, buffer);

  const storageResult = supabase.storage
    .from(VIDEO_BUCKET)
    .getPublicUrl(uploadFilePath);

  if (storageResult.error) {
    console.error(
      `Error getting public URL for ${uploadFilePath}`,
      storageResult.error
    );
    throw new Error(`Error getting public URL for ${uploadFilePath}`);
  }
  const publicUrl = storageResult.data.publicUrl;
  console.log(`Supabase public ${uploadFilePath} URL`, publicUrl);

  return { publicUrl };
};

export const getCallDetails = (callCid: string) => {
  const callId = callCid.replace("default:", "");
  // Having to pass the userID in the call ID because the webhook payload
  // doesn't presently include any way to identify the user who created the recording.
  // TODO: remove this in future as the payload should include something to identify the user.
  let userId = callId.replace("call_", "");
  userId = userId.substring(0, callId.lastIndexOf("_"));

  return { callId, userId };
};

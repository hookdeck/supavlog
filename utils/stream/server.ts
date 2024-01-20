import { StreamClient } from "@stream-io/node-sdk";

export const getClient = () => {
  return new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );
};

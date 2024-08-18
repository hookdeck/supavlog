"use server";

import { VlogItem } from "@/types/VlogItem";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateVlog(prevState: any, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in to update a vlog title");
  }

  const vlogId = formData.get("vlogId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  // TODO: validate form data
  const updates: { title?: string; description?: string } = {};
  if (title) {
    updates["title"] = title;
  }
  if (description) {
    updates["description"] = description;
  }

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", vlogId)
    .single();

  if (error) {
    // TODO: handle error
    console.error("Could not find vlog with ID", vlogId);
    return;
  }

  if (data) {
    const vlog = data as VlogItem;
    const { error } = await supabase
      .from("videos")
      .update(updates)
      .eq("id", vlogId);
    if (!error) {
      revalidatePath(`/vlogs/${vlog.by_username}/${vlogId}`);
      return { updated: true };
    } else {
      // TODO: handle error
      console.error("Error updating vlog title for vlog with ID", vlogId);
      return;
    }
  }
}

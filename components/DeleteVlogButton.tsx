"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Button from "./Button";

const supabase = createClient();

export default function DeleteVlogButton({
  vlogId,
  username,
}: {
  vlogId: string;
  username: string;
}) {
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const confirmDeletion = () => {
    setShowDeleteConfirmation(true);
  };

  const handleYes = async () => {
    const { error } = await supabase.from("videos").delete().eq("id", vlogId);
    if (error) {
      console.error(error);
    } else {
      setShowDeleteConfirmation(false);
      router.push(`/vlogs/${username}`);
    }
  };

  const handleNo = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <>
      {showDeleteConfirmation && (
        <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[400px] h-[100px] rounded-md bg-slate-900 p-4">
          <p className="text-center text-white">
            Are you sure you wish to delete this vlog?
          </p>
          <div className="flex flex-row gap10 p-4 justify-evenly">
            <Button className="bg-red-600 hover:bg-red-800" onClick={handleYes}>
              Yes
            </Button>
            <Button
              className="bg-slate-600 hover:bg-slate-800"
              onClick={handleNo}
            >
              No
            </Button>
          </div>
        </div>
      )}
      <Button
        className="bg-red-600 disabled:bg-slate-600"
        disabled={showDeleteConfirmation}
        onClick={confirmDeletion}
      >
        Delete
      </Button>
    </>
  );
}

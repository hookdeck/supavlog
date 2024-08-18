"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import Button from "./Button";
import { VlogItem } from "@/types/VlogItem";
import { updateVlog } from "@/app/actions/vlogs";

export default function VlogDescription({
  vlog,
  allowEdits,
}: {
  vlog: VlogItem;
  allowEdits: boolean;
}) {
  const [state, formAction, pending] = useFormState(updateVlog, null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (state) {
      setEditing(false);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      {editing ? (
        <form
          className="flex flex-col items-center gap-2 w-full"
          action={formAction}
        >
          <textarea
            required
            className="text-base text-left text-black w-full p-2"
            name="description"
            defaultValue={vlog.description}
          ></textarea>
          <input type="hidden" name="vlogId" value={vlog.id} />
          <div className="flex flex-row items-center gap-2">
            <Button disabled={pending}>Save</Button>
            <Button
              onClick={(e) => {
                setEditing(false);
              }}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="text-base mb-4">{vlog.description}</div>
          {allowEdits && (
            <Button
              onClick={(e) => {
                setEditing(true);
              }}
            >
              {vlog.description ? "Edit description" : "Add description"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import Button from "./Button";
import { VlogItem } from "@/types/VlogItem";
import { updateVlog } from "@/app/actions/vlogs";

export default function VlogTitle({
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
    <div className="flex flex-row gap-2 items-center">
      {editing ? (
        <form className="flex flex-row items-center gap-2" action={formAction}>
          <input
            className="text-2xl text-center text-black"
            type="text"
            name="title"
            defaultValue={vlog.title}
          />
          <input type="hidden" name="vlogId" value={vlog.id} />
          <Button disabled={pending}>Save</Button>
          <Button
            onClick={(e) => {
              setEditing(false);
            }}
            disabled={pending}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <h2 className="text-2xl text-center">
            {vlog.title || "No title available"}
          </h2>
          {allowEdits && (
            <Button
              onClick={(e) => {
                setEditing(true);
              }}
            >
              Edit
            </Button>
          )}
        </>
      )}
    </div>
  );
}

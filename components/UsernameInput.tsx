"use client";

import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { useState } from "react";

let _supabase: SupabaseClient | null = null;
const getSupabaseClient = (): SupabaseClient => {
  if (_supabase !== null) {
    return _supabase;
  }

  _supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return _supabase;
};

enum AllowUsernameStatus {
  "allow",
  "used",
  "too_short",
  "too_long",
}

export default function UsernameInput() {
  const [allowUsernameStatus, setAllowUsernameStatus] =
    useState<AllowUsernameStatus>(AllowUsernameStatus.too_short);

  const checkAvailability = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const username = event.target.value;

    if (username.length < 3) {
      setAllowUsernameStatus(AllowUsernameStatus.too_short);
      return;
    }

    const supabase = getSupabaseClient();
    const result = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username);

    if (result.count && result.count > 0) {
      setAllowUsernameStatus(AllowUsernameStatus.used);
    } else if (result.count == null || result.count === 0) {
      // TODO: work out the correct logic for the above condition
      setAllowUsernameStatus(AllowUsernameStatus.allow);
    } else {
      console.error("Unexpected result from profiles table", result);
    }
  };

  return (
    <div>
      <label className="text-md" htmlFor="username">
        Username
      </label>
      <div className="relative">
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6 w-full"
          name="username"
          placeholder="you"
          onChange={checkAvailability}
          required
          minLength={3}
        />
        <div className="top-3 right-2 absolute">
          {allowUsernameStatus === AllowUsernameStatus.used && (
            <p className="text-red-500 text-xs">Not available</p>
          )}
          {allowUsernameStatus === AllowUsernameStatus.allow && (
            <p className="text-green-500 text-xs">Available</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LinkButton from "@/components/LinkButton";
import UsernameInput from "@/components/UsernameInput";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signUp = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          username,
        },
      },
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/login?message=Check email to continue sign in process");
  };

  return (
    <div className="flex-1 flex flex-col w-full gap-10">
      <div>
        <LinkButton href="/" arrow="left">
          Back
        </LinkButton>
      </div>
      {process.env.NEXT_PUBLIC_SIGNUP_ENABLED === "true" ? (
        <div className="flex flex-col sm:max-w-md animate-in w-full justify-center gap-10 m-auto">
          <h1 className="text-xl">Signup</h1>
          <form
            className="sm:max-w-md flex-1 flex flex-col w-full m-auto gap-2 text-foreground"
            action={signUp}
          >
            <label className="text-md" htmlFor="email">
              Email
            </label>
            <input
              className="rounded-md px-4 py-2 bg-inherit border mb-6"
              name="email"
              placeholder="you@example.com"
              required
            />
            <UsernameInput />
            <label className="text-md" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-md px-4 py-2 bg-inherit border mb-6"
              type="password"
              name="password"
              placeholder=""
              required
            />
            <button className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2">
              Sign Up
            </button>
            {searchParams?.message && (
              <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                {searchParams.message}
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="flex flex-col sm:max-w-md animate-in w-full justify-center gap-10 m-auto">
          <h1 className="text-xl">Signup disabled</h1>
          <p className="text-md">
            Signup is currently disabled. If this is your instance of SupaVlog
            ensure you have set the{" "}
            <code className="text-red-500">NEXT_PUBLIC_SIGNUP_ENABLED</code>{" "}
            environment variable to <code className="text-red-500">true</code>{" "}
            to enable signup.
          </p>
        </div>
      )}
    </div>
  );
}

import HookdeckLogo from "./logos/HookdeckLogo";
import NextLogo from "./logos/NextLogo";
import StreamLogo from "./logos/StreamLogo";
import SupabaseLogo from "./logos/SupabaseLogo";
import Image from "next/image";

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="sr-only">
        SupaVlog - Open Source Micro Vlogging Application
      </h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Open Source
        <br />
        <span className="font-bold">
          Micro{" "}
          <span title="Video Blogging" className="cursor-help">
            Vlogging
          </span>{" "}
          Application
        </span>
      </p>
      <Image
        src="/images/supavlog-capture.png"
        width={800}
        height={600}
        alt="Supavlog capture"
        className="rounded-md shadow-xl"
      />
      <div className="flex gap-8 justify-center items-center">
        Built with{" "}
        <a
          href="https://supabase.com/?ref=supavlog"
          target="_blank"
          rel="noreferrer"
        >
          <SupabaseLogo />
        </a>
        <span className="border-l rotate-45 h-6" />
        <a
          href="https://getstream.io?ref=supavlog"
          target="_blank"
          rel="noreferrer"
        >
          <StreamLogo />
        </a>
        <span className="border-l rotate-45 h-6" />
        <a
          href="https://hookdeck.com?ref=supavlog"
          target="_blank"
          rel="noreferrer"
        >
          <HookdeckLogo />
        </a>
        <span className="border-l rotate-45 h-6" />
        <a
          href="https://nextjs.org/?ref=supavlog"
          target="_blank"
          rel="noreferrer"
        >
          <NextLogo />
        </a>
      </div>
      {/* <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" /> */}
    </div>
  );
}

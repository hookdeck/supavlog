import HookdeckLogo from "@/components/logos/HookdeckLogo";
import NextLogo from "@/components/logos/NextLogo";
import StreamLogo from "@/components/logos/StreamLogo";
import SupabaseLogo from "@/components/logos/SupabaseLogo";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
      <div className="flex flex-col gap-16 items-center">
        <h1 className="sr-only">
          SupaVlog - Open Source Micro Vlogging Application Template
        </h1>
        <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
          Open Source
          <br />
          <span className="font-bold">
            <span title="Video Blogging" className="cursor-help">
              Vlog
            </span>{" "}
          </span>
          Application Template
        </p>
        <span className="text-base text-center flex flex-row gap-8">
          <Link
            href="/vlogs"
            className="hover:underline flex flex-row items-center gap-1"
          >
            <Image
              src="/icons/video.svg"
              width={24}
              height={24}
              alt="Video icon"
              className="invert"
            />
            Watch the Vlogs
          </Link>
          <span className="border border-solid border-slate-700"></span>
          <Link
            href="https://github.com/hookdeck/supavlog"
            className="hover:underline flex flex-row items-center gap-1"
          >
            <Image
              src="/icons/github.svg"
              width={24}
              height={24}
              alt="GitHub logo"
              className="invert"
            />
            Get the code on GitHub
          </Link>
        </span>
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
    </div>
  );
}

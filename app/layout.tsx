import { GeistSans } from "geist/font/sans";
import "./globals.css";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import Image from "next/image";

let defaultUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
if (!defaultUrl) {
  defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:8080";
}

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "SupaVlog - Vlog Application Starter Kit",
  description:
    "Vlog (Video Blog) Application Starter Kit with Supabase, Stream, Hookdeck, and Next.js - SupaVlog",
  openGraph: {
    images: `${defaultUrl}/images/supavlog-capture.png`,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <link
          rel="shortcut icon"
          type="image/svg"
          href={`${defaultUrl}/icons/supavlog.svg`}
        />
      </head>
      <body className="bg-background text-foreground">
        <div className="flex-1 w-full flex flex-col gap-10 items-center min-h-screen">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
              <span className="text-2xl">
                <Link className="flex flex-row gap-1 items-center" href="/">
                  <Image
                    src="/icons/video.svg"
                    width={24}
                    height={24}
                    alt="Video icon"
                    className="dark:invert"
                  />
                  SupaVlog
                </Link>
              </span>
              {user && <AuthButton />}
            </div>
          </nav>
          <main className="w-full max-w-4xl flex justify-between">
            {children}
          </main>
          <footer className="w-full border-t border-t-foreground/10 p-8 justify-center text-center text-xs">
            <p>
              Powered by{" "}
              <a
                href="https://supabase.com/?ref=supavlog"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
              >
                Supabase
              </a>
              ,{" "}
              <a
                href="https://getstream.io/?ref=supavlog"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
              >
                Stream
              </a>
              , &amp;{" "}
              <a
                href="https://hookdeck.com/?ref=supavlog"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
              >
                Hookdeck
              </a>
            </p>
            <p>
              Video storage configuration:{" "}
              <code>{process.env.VIDEO_STORAGE_PLATFORM}</code>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

let defaultUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
if (defaultUrl === undefined) {
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:8080";
}

export const metadata = {
  metadataBase: new URL(defaultUrl!),
  title: "SupaVlog - Vlog Application Starter Kit",
  description:
    "Vlog (Video Blog) Application Starter Kit with Supabase, Stream, Hookdeck, and Next.js - SupaVlog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient(cookieStore);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <link
          rel="shortcut icon"
          type="image/svg"
          href={`${defaultUrl}/icons/supavlog.svg`}
        />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta
          property="og:image"
          content={`${defaultUrl}/images/supavlog-capture.png`}
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="2048" />
        <meta property="og:image:height" content="1200" />
      </head>
      <body className="bg-background text-foreground">
        <div className="flex-1 w-full flex flex-col gap-10 items-center min-h-screen">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
              <span className="text-2xl">
                <Link href="/">SupaVlog</Link>
              </span>
              {isSupabaseConnected && <AuthButton />}
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

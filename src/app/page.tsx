import type { CSSProperties } from "react";
import Link from "next/link";
import { ensureSettings, serializeSettings } from "@/lib/data";
import { getFontClass } from "@/lib/format";

export default async function HomePage() {
  const settings = serializeSettings(await ensureSettings());
  const fontClass = getFontClass(settings.fontKey);

  return (
    <main
      className={`app-shell min-h-screen px-6 py-10 text-stone-900 ${fontClass}`}
      style={
        {
          ["--app-primary" as string]: settings.primaryColor,
          ["--app-secondary" as string]: settings.secondaryColor,
          ["--app-accent" as string]: settings.accentColor,
          ["--app-background" as string]: settings.backgroundColor,
          ["--app-surface" as string]: settings.surfaceColor
        } as CSSProperties
      }
    >
      <div className="mx-auto max-w-5xl">
        <section className="section-card overflow-hidden p-8 md:p-12">
          <div className="mb-8 inline-flex rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-stone-600">
            Website Undangan Lamaran
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-none text-stone-900 md:text-7xl">
            Undangan digital personal dengan admin, RSVP, dan kirim WhatsApp.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            Aplikasi ini sudah disiapkan untuk undangan lamaran yang bisa dibuka tamu lewat link
            personal, lengkap dengan animasi amplop, pengaturan tema, pengelolaan tamu, dan daftar
            hadir.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/invitation/public" className="btn-primary">
              Buka Undangan
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

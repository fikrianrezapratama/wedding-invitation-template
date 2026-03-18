"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { formatDateId, getFontClass } from "@/lib/format";
import type { SerializedGuestbookEntry, SerializedSettings } from "@/types";

type InvitationExperienceProps = {
  settings: SerializedSettings;
  guestName: string;
  guestSlug: string;
  guestbookEntries: SerializedGuestbookEntry[];
};

type OpeningPhase = "closed" | "opening" | "opened";

function themedColorMix(primary: string, secondary: string, ratio = 0.5) {
  const percent = Math.round(ratio * 100);
  const secondaryPercent = 100 - percent;
  return `color-mix(in srgb, ${primary} ${percent}%, ${secondary} ${secondaryPercent}%)`;
}

function useCountdown(targetDate: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => {
    const target = new Date(targetDate).getTime();
    const distance = Math.max(target - now, 0);

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((distance / (1000 * 60)) % 60),
      seconds: Math.floor((distance / 1000) % 60)
    };
  }, [now, targetDate]);
}

function ScrollReveal({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 38, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function FloatingDecor() {
  return (
    <>
      <div className="floating-orb absolute left-[6%] top-24 h-28 w-28 rounded-full bg-[color:var(--app-secondary)]/70 blur-xl" />
      <div className="floating-orb delay-1 absolute right-[12%] top-40 h-40 w-40 rounded-full bg-[color:var(--app-accent)]/25 blur-2xl" />
      <div className="floating-orb delay-2 absolute bottom-20 left-[14%] h-36 w-36 rounded-full bg-[color:var(--app-primary)]/15 blur-2xl" />
      <div className="sparkle absolute left-[14%] top-[20%] h-3 w-3 rounded-full bg-white/80" />
      <div className="sparkle absolute right-[18%] top-[28%] h-2.5 w-2.5 rounded-full bg-[color:var(--app-accent)]/70" />
      <div className="sparkle absolute bottom-[18%] right-[22%] h-3 w-3 rounded-full bg-white/80" />
    </>
  );
}

function MediaFigure({
  src,
  alt,
  fallbackLabel,
  className,
  imageClassName,
  imageKey,
  objectPosition = "50% 50%"
}: {
  src?: string | null;
  alt: string;
  fallbackLabel: string;
  className: string;
  imageClassName: string;
  imageKey: string;
  objectPosition?: string;
}) {
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    setIsBroken(false);
  }, [imageKey]);

  if (!src || isBroken) {
    return (
      <div className={`${className} theme-photo-fallback flex items-center justify-center`}>
        <div className="px-6 text-center">
          <p className="theme-muted text-xs uppercase tracking-[0.3em]">Preview</p>
          <p className="theme-ink mt-3 text-xl font-semibold">{fallbackLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        key={imageKey}
        src={src}
        alt={alt}
        className={imageClassName}
        style={{ objectPosition }}
        onError={() => setIsBroken(true)}
      />
    </div>
  );
}

export function InvitationExperience({
  settings,
  guestName,
  guestSlug,
  guestbookEntries: initialEntries
}: InvitationExperienceProps) {
  const [phase, setPhase] = useState<OpeningPhase>("closed");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [guestbookEntries, setGuestbookEntries] = useState(initialEntries);
  const [guestbookStatus, setGuestbookStatus] = useState("");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicFeedback, setMusicFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const countdown = useCountdown(settings.eventDate);
  const fontClass = getFontClass(settings.fontKey);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const openTimeoutRef = useRef<number | null>(null);
  const backgroundImageUrl = settings.showBackgroundImage ? settings.backgroundImageUrl : null;
  const envelopeImageUrl = settings.showEnvelopePhoto ? settings.envelopeImageUrl : null;
  const heroImageUrl = settings.showHeroPhoto ? settings.coverImageUrl : null;
  const hasBackgroundImage = Boolean(backgroundImageUrl);
  const hasEnvelopePhoto = Boolean(envelopeImageUrl);
  const hasHeroPhoto = Boolean(heroImageUrl);
  const themeStyles = useMemo(
    () => ({
      ink: { color: themedColorMix("var(--app-primary)", "#111827", 0.7) } as CSSProperties,
      muted: { color: themedColorMix("var(--app-primary)", "#6b7280", 0.45) } as CSSProperties,
      softCard: {
        background: themedColorMix("var(--app-surface)", "#ffffff", 0.82),
        borderColor: themedColorMix("var(--app-secondary)", "#ffffff", 0.46)
      } as CSSProperties,
      softGradient: {
        background: `linear-gradient(145deg, ${themedColorMix("#ffffff", "var(--app-secondary)", 0.9)}, ${themedColorMix(
          "var(--app-secondary)",
          "#ffffff",
          0.7
        )})`
      } as CSSProperties,
      darkCard: {
        background: `linear-gradient(135deg, ${themedColorMix("var(--app-primary)", "#111827", 0.82)}, ${themedColorMix(
          "var(--app-accent)",
          "#111827",
          0.78
        )})`
      } as CSSProperties,
      envelopeFlap: {
        background: `linear-gradient(135deg, ${themedColorMix("var(--app-accent)", "#ffffff", 0.72)}, ${themedColorMix(
          "var(--app-primary)",
          "#111827",
          0.72
        )})`
      } as CSSProperties,
      envelopeBody: {
        background: `linear-gradient(180deg, ${themedColorMix("var(--app-secondary)", "#ffffff", 0.7)}, ${themedColorMix(
          "var(--app-accent)",
          "#ffffff",
          0.55
        )})`
      } as CSSProperties
    }),
    []
  );

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        window.clearTimeout(openTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase === "opened" && settings.showMusic && settings.musicUrl && !isMusicPlaying) {
      void playMusic();
    }
  }, [isMusicPlaying, phase, settings.musicUrl, settings.showMusic]);

  useEffect(() => {
    if (audioRef.current && settings.musicUrl) {
      audioRef.current.load();
    }
  }, [settings.musicUrl]);

  function applyMusicStartOffset() {
    if (!audioRef.current || settings.musicStartSeconds <= 0) {
      return;
    }

    const audio = audioRef.current;
    const seekToStart = () => {
      if (audio.currentTime > 0.25) {
        return;
      }

      const duration =
        Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null;
      const nextTime = duration
        ? Math.min(settings.musicStartSeconds, Math.max(duration - 0.25, 0))
        : settings.musicStartSeconds;

      try {
        audio.currentTime = nextTime;
      } catch {
        return;
      }
    };

    if (audio.readyState >= 1) {
      seekToStart();
      return;
    }

    audio.addEventListener("loadedmetadata", seekToStart, { once: true });
  }

  async function playMusic() {
    if (!settings.showMusic || !settings.musicUrl || !audioRef.current) {
      return;
    }

    try {
      applyMusicStartOffset();
      audioRef.current.muted = false;
      audioRef.current.volume = 1;
      await audioRef.current.play();
      setMusicFeedback("");
      setIsMusicPlaying(true);
    } catch {
      setMusicFeedback("Musik siap diputar, tetapi browser meminta tombol play ditekan sekali lagi.");
      setIsMusicPlaying(false);
    }
  }

  function toggleMusic() {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      void playMusic();
      return;
    }

    audioRef.current.pause();
    setIsMusicPlaying(false);
  }

  function openInvitation() {
    if (phase !== "closed") return;

    setPhase("opening");
    void playMusic();
    openTimeoutRef.current = window.setTimeout(() => {
      setPhase("opened");
    }, 1650);
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      setRsvpMessage("");

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug: guestSlug,
          name: formData.get("name"),
          attendance: formData.get("attendance"),
          guestCount: Number(formData.get("guestCount") || 1),
          message: formData.get("message")
        })
      });

      if (!response.ok) {
        setRsvpMessage("RSVP belum berhasil disimpan. Coba lagi.");
        return;
      }

      form.reset();
      setRsvpMessage("Terima kasih, konfirmasi kehadiran Anda sudah tersimpan.");
    });
  }

  async function submitGuestbook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      setGuestbookStatus("");

      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug: guestSlug,
          name: formData.get("name"),
          message: formData.get("message")
        })
      });

      if (!response.ok) {
        setGuestbookStatus("Ucapan belum berhasil disimpan.");
        return;
      }

      const data = (await response.json()) as { entry: SerializedGuestbookEntry };
      setGuestbookEntries((current) => [data.entry, ...current].slice(0, 12));
      form.reset();
      setGuestbookStatus("Ucapan Anda sudah tampil.");
    });
  }

  return (
    <main
      className={`app-shell min-h-screen ${fontClass}`}
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
      {settings.showMusic && settings.musicUrl ? (
        <audio
          ref={audioRef}
          src={settings.musicUrl}
          preload="auto"
          loop
          playsInline
          onPause={() => setIsMusicPlaying(false)}
          onPlay={() => setIsMusicPlaying(true)}
        />
      ) : null}

      <section className="relative isolate min-h-screen overflow-hidden px-5 py-6 md:px-10 md:py-10">
        <div className="absolute inset-0 -z-20 opacity-30">
          {hasBackgroundImage ? (
            <img
              src={backgroundImageUrl || undefined}
              alt="Background undangan"
              className="h-full w-full object-cover"
              style={{
                objectPosition: `${settings.backgroundImageFocusX}% ${settings.backgroundImageFocusY}%`
              }}
            />
          ) : null}
        </div>
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(circle at top, ${themedColorMix("#ffffff", "var(--app-secondary)", 0.88)}, ${themedColorMix(
              "var(--app-background)",
              "#ffffff",
              0.9
            )} 42%, ${themedColorMix("var(--app-secondary)", "var(--app-background)", 0.68)})`
          }}
        />
        <FloatingDecor />

        <AnimatePresence mode="wait">
          {phase !== "opened" ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={
                  phase === "opening"
                    ? { opacity: 0, y: -20, scale: 0.96 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                className="mb-10 max-w-xl text-center"
              >
                <p className="theme-muted text-sm uppercase tracking-[0.35em]">Kepada Yth.</p>
                <h1 className="theme-ink mt-4 text-4xl font-semibold md:text-6xl">
                  {guestName}
                </h1>
                <p className="theme-muted mt-5 text-lg leading-8">{settings.introMessage}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                animate={
                  phase === "opening"
                    ? { opacity: 1, scale: 1.1, y: -24 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative w-full ${
                  hasEnvelopePhoto ? "max-w-[min(100%,46rem)]" : "max-w-[min(100%,40rem)]"
                }`}
              >
                <div
                  className="romantic-gradient envelope-shadow relative mx-auto aspect-[1.42/1] w-full cursor-pointer overflow-hidden rounded-[1.8rem] sm:rounded-[2.2rem] lg:rounded-[2.75rem]"
                  onClick={openInvitation}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openInvitation();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Buka undangan"
                >
                  <motion.div
                    initial={false}
                    animate={phase === "opening" ? { rotateX: 180 } : { rotateX: 0 }}
                    transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute left-0 right-0 top-0 h-[52%] origin-top"
                    style={{
                      ...themeStyles.envelopeFlap,
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)"
                    }}
                  />

                  <div
                    className="absolute inset-x-0 bottom-0 top-[34%] rounded-b-[1.8rem] sm:rounded-b-[2.2rem] lg:rounded-b-[2.75rem]"
                    style={themeStyles.envelopeBody}
                  />

                  <motion.div
                    initial={false}
                    animate={
                      phase === "opening"
                        ? { y: -116, scale: 1.04, rotate: -1.5 }
                        : { y: -2, scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-[6%] bottom-[9%] top-[14%] rounded-[1.35rem] p-4 shadow-2xl backdrop-blur sm:rounded-[1.7rem] sm:p-5 lg:rounded-[2rem] lg:p-6"
                    style={themeStyles.softCard}
                  >
                    <div
                      className={`grid h-full gap-4 ${
                        hasEnvelopePhoto ? "lg:grid-cols-[0.82fr_1.18fr]" : ""
                      }`}
                    >
                      {hasEnvelopePhoto ? (
                        <motion.div
                          animate={phase === "opening" ? { scale: 1.08 } : { scale: 1 }}
                          transition={{ duration: 1.3 }}
                        >
                          <MediaFigure
                            src={envelopeImageUrl || undefined}
                            alt="Preview envelope"
                            fallbackLabel="Foto amplop"
                            className="relative h-full min-h-[108px] overflow-hidden rounded-[1.15rem] sm:min-h-[132px] sm:rounded-[1.45rem] lg:min-h-[180px] lg:rounded-[1.7rem]"
                            imageClassName="h-full w-full object-cover"
                            imageKey={`envelope:${envelopeImageUrl || "none"}`}
                            objectPosition={`${settings.envelopeImageFocusX}% ${settings.envelopeImageFocusY}%`}
                          />
                        </motion.div>
                      ) : null}
                      <div
                        className={`flex flex-col justify-between ${
                          hasEnvelopePhoto ? "" : "mx-auto h-full max-w-[30rem] items-center text-center"
                        }`}
                      >
                        <div>
                          <p className="theme-muted text-sm uppercase tracking-[0.3em]">
                            Undangan Lamaran
                          </p>
                          <h2
                            className={`theme-ink mt-3 font-semibold leading-tight sm:mt-4 sm:text-[2.2rem] ${
                              hasEnvelopePhoto ? "text-3xl lg:text-4xl" : "text-3xl lg:text-5xl"
                            }`}
                          >
                            {settings.brideName} & {settings.groomName}
                          </h2>
                          <p
                            className={`theme-muted mt-3 text-sm leading-7 sm:mt-4 ${
                              hasEnvelopePhoto ? "sm:text-base" : "mx-auto max-w-2xl sm:text-base lg:text-lg"
                            }`}
                          >
                            {settings.heroHeadline}
                          </p>
                        </div>
                        <div className="mt-6">
                          <motion.button
                            type="button"
                            className="btn-primary w-full sm:w-auto"
                            whileTap={{ scale: 0.98 }}
                            onClick={(event) => {
                              event.stopPropagation();
                              openInvitation();
                            }}
                          >
                            {phase === "opening" ? "Membuka..." : "Buka Undangan"}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 48, scale: 1.02 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex max-w-6xl flex-col gap-6 py-6 md:py-10"
            >
              {settings.showMusic && settings.musicUrl ? (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="music-pill fixed bottom-5 right-5 z-20 flex items-center gap-3 rounded-full px-4 py-3 text-sm backdrop-blur"
                  style={themeStyles.softCard}
                  onClick={toggleMusic}
                >
                  <span className="theme-dark-block flex h-8 w-8 items-center justify-center rounded-full text-xs text-white">
                    {isMusicPlaying ? "II" : ">"}
                  </span>
                  <span className="max-w-[180px] truncate">{settings.musicTitle || "Background Music"}</span>
                </motion.button>
              ) : null}

              {musicFeedback ? (
                <div className="mx-auto max-w-4xl rounded-[1.3rem] px-5 py-4 text-sm theme-muted" style={themeStyles.softCard}>
                  {musicFeedback}
                </div>
              ) : null}

              {settings.showHero ? (
                <ScrollReveal
                  className={`section-card overflow-hidden ${settings.layoutStyle === "classic" ? "p-8 md:p-10" : "p-4 md:p-6"}`}
                >
                  <div className={`grid items-center gap-6 ${hasHeroPhoto ? "md:grid-cols-[1.08fr_0.92fr]" : ""}`}>
                    <div
                      className={`rounded-[2.1rem] p-8 md:p-10 ${
                        hasHeroPhoto ? "" : "w-full text-center"
                      }`}
                      style={themeStyles.softGradient}
                    >
                      <p className="theme-muted text-sm uppercase tracking-[0.35em]">Lamaran</p>
                      <h1 className="theme-ink mt-4 text-5xl font-semibold leading-none md:text-7xl">
                        {settings.brideName} <span className="text-[color:var(--app-accent)]">&</span>{" "}
                        {settings.groomName}
                      </h1>
                      <p
                        className={`theme-muted mt-6 text-lg leading-8 ${
                          hasHeroPhoto ? "max-w-2xl" : "mx-auto max-w-3xl"
                        }`}
                      >
                        {settings.heroHeadline}
                      </p>
                      <div
                        className={`mt-8 rounded-[1.5rem] p-5 ${
                          hasHeroPhoto ? "max-w-xl" : "mx-auto max-w-2xl text-left"
                        }`}
                        style={themeStyles.softCard}
                      >
                        <p className="theme-muted text-sm uppercase tracking-[0.2em]">Kepada Yth.</p>
                        <p className="theme-ink mt-2 text-2xl font-semibold">{guestName}</p>
                        <p className="theme-muted mt-3 text-sm leading-7">
                          Dengan penuh hormat kami mengundang Anda untuk hadir dan menyaksikan momen
                          istimewa ini bersama kami.
                        </p>
                      </div>
                    </div>
                    {hasHeroPhoto ? (
                      <motion.div
                        initial={{ scale: 1.08 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.3 }}
                        className="rounded-[2.1rem]"
                      >
                        <MediaFigure
                          src={heroImageUrl || undefined}
                          alt="Foto pasangan"
                          fallbackLabel="Foto pasangan"
                          className="h-[300px] overflow-hidden rounded-[2.1rem] sm:h-[360px] md:h-[460px]"
                          imageClassName="h-[300px] w-full object-cover sm:h-[360px] md:h-[460px]"
                          imageKey={`cover:${heroImageUrl || "none"}`}
                          objectPosition={`${settings.coverImageFocusX}% ${settings.coverImageFocusY}%`}
                        />
                      </motion.div>
                    ) : null}
                  </div>
                </ScrollReveal>
              ) : null}

              {settings.showEventDetails ? (
                <ScrollReveal className="section-card overflow-hidden p-8 md:p-10" delay={0.05}>
                  <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                    <div>
                      <p className="theme-muted text-sm uppercase tracking-[0.35em]">
                        {settings.eventTitle}
                      </p>
                      <h2 className="theme-ink mt-4 text-4xl font-semibold md:text-5xl">
                        Detail acara kami
                      </h2>
                      <p className="theme-muted mt-4 max-w-2xl text-lg leading-8">
                        Informasi inti kami letakkan di satu tempat agar undangan terasa lebih
                        ringkas dan mudah dibaca.
                      </p>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.7rem] p-6" style={themeStyles.softCard}>
                          <p className="theme-muted text-sm uppercase tracking-[0.2em]">Tanggal</p>
                          <p className="theme-ink mt-3 text-2xl font-semibold">
                            {formatDateId(settings.eventDate)}
                          </p>
                        </div>
                        <div className="theme-dark-block rounded-[1.7rem] p-6 text-white">
                          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Waktu</p>
                          <p className="mt-3 text-2xl font-semibold">{settings.eventTimeLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[2rem] p-6 md:p-8" style={themeStyles.softCard}>
                      <p className="theme-muted text-sm uppercase tracking-[0.3em]">Tempat Acara</p>
                      <h3 className="theme-ink mt-4 text-3xl font-semibold">{settings.venueName}</h3>
                      <p className="theme-muted mt-4 text-base leading-8 md:text-lg">
                        {settings.venueAddress}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ) : null}

              {settings.showCountdown ? (
                <ScrollReveal className="section-card p-8 md:p-10" delay={0.08}>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="theme-muted text-sm uppercase tracking-[0.35em]">
                        {settings.countdownTitle}
                      </p>
                      <p className="theme-muted mt-3 max-w-2xl text-lg leading-8">
                        Hari yang kami nantikan semakin dekat. Kehadiran Anda akan membuatnya semakin
                        hangat dan berarti.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    {[
                      { label: "Hari", value: countdown.days },
                      { label: "Jam", value: countdown.hours },
                      { label: "Menit", value: countdown.minutes },
                      { label: "Detik", value: countdown.seconds }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.65 }}
                        className="theme-dark-block rounded-[1.7rem] p-6 text-white"
                      >
                        <p className="text-4xl font-semibold">{String(item.value).padStart(2, "0")}</p>
                        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/70">
                          {item.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </ScrollReveal>
              ) : null}

              {settings.showLocation ? (
                <ScrollReveal className="section-card overflow-hidden p-8 md:p-10" delay={0.1}>
                  <div>
                    <p className="theme-muted text-sm uppercase tracking-[0.35em]">Peta Lokasi</p>
                    <h2 className="theme-ink mt-4 text-4xl font-semibold">Panduan menuju venue</h2>
                    <p className="theme-muted mt-4 max-w-2xl text-lg leading-8">
                      Gunakan peta berikut untuk mempermudah perjalanan Anda menuju lokasi acara.
                    </p>
                  </div>
                  <div className="mt-6 overflow-hidden rounded-[2rem]" style={themeStyles.softCard}>
                    {settings.mapEmbedUrl ? (
                      <iframe
                        src={settings.mapEmbedUrl}
                        className="h-[340px] w-full border-0 md:h-[400px]"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Peta lokasi acara"
                      />
                    ) : (
                      <div className="theme-muted flex h-[220px] items-center justify-center px-6 text-center text-sm leading-7 md:h-[260px]">
                        Peta belum ditambahkan. Anda tetap bisa membagikan link Google Maps dari
                        panel admin.
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ) : null}

              {settings.showGallery ? (
                <ScrollReveal className="section-card p-8 md:p-10" delay={0.12}>
                  <p className="theme-muted text-sm uppercase tracking-[0.35em]">Galeri</p>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {settings.galleryItems.map((item, index) => (
                      <motion.figure
                        key={item.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.07, duration: 0.65 }}
                        className="overflow-hidden rounded-[1.8rem]"
                        style={themeStyles.softCard}
                      >
                        <MediaFigure
                          src={item.imageUrl}
                          alt={item.caption || "Galeri"}
                          fallbackLabel="Galeri"
                          className="h-64 overflow-hidden md:h-72"
                          imageClassName="h-64 w-full object-cover md:h-72"
                          imageKey={`gallery:${item.id}:${item.imageUrl}`}
                          objectPosition="50% 50%"
                        />
                        {item.caption ? (
                          <figcaption className="theme-muted p-4 text-sm leading-7">{item.caption}</figcaption>
                        ) : null}
                      </motion.figure>
                    ))}
                  </div>
                </ScrollReveal>
              ) : null}

              {settings.showStory ? (
                <ScrollReveal className="section-card p-8 md:p-10" delay={0.14}>
                  <p className="theme-muted text-sm uppercase tracking-[0.35em]">{settings.storyTitle}</p>
                  <blockquote className="theme-ink mt-6 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">
                    “{settings.quoteText}”
                  </blockquote>
                  <p className="theme-muted mt-6 max-w-3xl text-lg leading-8">{settings.storyText}</p>
                </ScrollReveal>
              ) : null}

              {settings.showRsvp ? (
                <ScrollReveal className="section-card p-8 md:p-10" delay={0.16}>
                  <p className="theme-muted text-sm uppercase tracking-[0.35em]">{settings.rsvpTitle}</p>
                  <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submitRsvp}>
                    <div>
                      <label className="field-label" htmlFor="rsvp-name">
                        Nama
                      </label>
                      <input
                        id="rsvp-name"
                        name="name"
                        defaultValue={guestName}
                        className="field-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="attendance">
                        Kehadiran
                      </label>
                      <select id="attendance" name="attendance" className="field-input" defaultValue="HADIR">
                        <option value="HADIR">Hadir</option>
                        <option value="TIDAK_HADIR">Tidak Hadir</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="guestCount">
                        Jumlah Tamu
                      </label>
                      <input
                        id="guestCount"
                        name="guestCount"
                        type="number"
                        min={1}
                        defaultValue={1}
                        className="field-input"
                        required
                      />
                    </div>
                    <div className="md:row-span-2">
                      <label className="field-label" htmlFor="rsvp-message">
                        Pesan
                      </label>
                      <textarea
                        id="rsvp-message"
                        name="message"
                        rows={6}
                        className="field-input"
                        placeholder="Tulis pesan singkat untuk tuan rumah"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" className="btn-primary" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Kirim RSVP"}
                      </button>
                      {rsvpMessage ? <p className="theme-muted mt-3 text-sm">{rsvpMessage}</p> : null}
                    </div>
                  </form>
                </ScrollReveal>
              ) : null}

              {settings.showGuestbook ? (
                <ScrollReveal className="section-card p-8 md:p-10" delay={0.18}>
                  <div className="grid gap-8 md:grid-cols-[0.84fr_1.16fr]">
                    <div>
                      <p className="theme-muted text-sm uppercase tracking-[0.35em]">
                        {settings.guestbookTitle}
                      </p>
                      <form className="mt-6 space-y-4" onSubmit={submitGuestbook}>
                        <div>
                          <label className="field-label" htmlFor="guestbook-name">
                            Nama
                          </label>
                          <input
                            id="guestbook-name"
                            name="name"
                            defaultValue={guestName}
                            className="field-input"
                            required
                          />
                        </div>
                        <div>
                          <label className="field-label" htmlFor="guestbook-message">
                            Ucapan
                          </label>
                          <textarea
                            id="guestbook-message"
                            name="message"
                            rows={5}
                            className="field-input"
                            required
                            placeholder="Tulis doa dan ucapan terbaik Anda"
                          />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isPending}>
                          {isPending ? "Menyimpan..." : "Kirim Ucapan"}
                        </button>
                        {guestbookStatus ? (
                          <p className="theme-muted text-sm leading-7">{guestbookStatus}</p>
                        ) : null}
                      </form>
                    </div>

                    <div className="space-y-4">
                      {guestbookEntries.length ? (
                        guestbookEntries.map((entry, index) => (
                          <motion.article
                            key={entry.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05, duration: 0.55 }}
                            className="rounded-[1.5rem] p-5"
                            style={themeStyles.softCard}
                          >
                            <p className="theme-ink text-lg font-semibold">{entry.name}</p>
                            <p className="theme-muted mt-3 text-sm leading-7">{entry.message}</p>
                          </motion.article>
                        ))
                      ) : (
                        <div className="theme-muted rounded-[1.5rem] p-5 text-sm leading-7" style={themeStyles.softCard}>
                          Belum ada ucapan. Jadilah yang pertama meninggalkan doa terbaik.
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

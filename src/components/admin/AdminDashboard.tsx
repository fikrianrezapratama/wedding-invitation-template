"use client";

import type { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateTimeId, getLayoutLabel } from "@/lib/format";
import { themePresets } from "@/lib/theme";
import type {
  AdminDashboardData,
  SerializedGalleryItem,
  SerializedGuest,
  SerializedGuestbookEntry,
  SerializedSettings
} from "@/types";

type AdminDashboardProps = {
  initialData: AdminDashboardData;
};

type GuestFormState = {
  name: string;
  phone: string;
  note: string;
};

type ImageUploadTarget = "coverImageUrl" | "backgroundImageUrl" | "envelopeImageUrl" | "gallery";
type UploadTarget = ImageUploadTarget | "musicUrl";

type CropDraft = {
  target: ImageUploadTarget;
  file: File;
  previewUrl: string;
  caption: string;
};

function getBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }

  return window.location.origin;
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<SerializedSettings>(initialData.settings);
  const [guests, setGuests] = useState(initialData.guests);
  const [rsvps] = useState(initialData.rsvps);
  const [guestbookEntries, setGuestbookEntries] = useState(initialData.guestbookEntries);
  const [guestForm, setGuestForm] = useState<GuestFormState>({
    name: "",
    phone: "",
    note: ""
  });
  const [galleryCaption, setGalleryCaption] = useState("");
  const [cropDraft, setCropDraft] = useState<CropDraft | null>(null);
  const [status, setStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [guestStatus, setGuestStatus] = useState("");
  const [guestbookStatus, setGuestbookStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const hadir = rsvps.filter((item) => item.attendance === "HADIR");
    const tidakHadir = rsvps.filter((item) => item.attendance === "TIDAK_HADIR");

    return {
      invited: guests.length,
      hadir: hadir.length,
      tidakHadir: tidakHadir.length,
      totalKursi: hadir.reduce((total, item) => total + item.guestCount, 0)
    };
  }, [guests.length, rsvps]);

  const activePreset = themePresets.find((preset) => preset.key === settings.themePreset) || null;

  function updateSettings<K extends keyof SerializedSettings>(
    key: K,
    value: SerializedSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));
  }

  function applyThemePreset(presetKey: string) {
    const preset = themePresets.find((item) => item.key === presetKey);
    if (!preset) return;

    setSettings((current) => ({
      ...current,
      themePreset: preset.key,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      surfaceColor: preset.surfaceColor,
      fontKey: preset.fontKey,
      layoutStyle: preset.layoutStyle
    }));
  }

  function markThemeCustom<K extends keyof SerializedSettings>(
    key: K,
    value: SerializedSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      themePreset: "custom",
      [key]: value
    }));
  }

  async function saveSettings() {
    startTransition(async () => {
      setStatus("");
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        setStatus("Pengaturan belum berhasil disimpan.");
        return;
      }

      const data = (await response.json()) as { settings: SerializedSettings };
      setSettings(data.settings);
      setStatus("Pengaturan undangan berhasil diperbarui.");
      router.refresh();
    });
  }

  async function createGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setGuestStatus("");
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(guestForm)
      });

      if (!response.ok) {
        setGuestStatus("Tamu belum berhasil ditambahkan.");
        return;
      }

      const data = (await response.json()) as { guest: SerializedGuest };
      setGuests((current) => [data.guest, ...current]);
      setGuestForm({ name: "", phone: "", note: "" });
      setGuestStatus("Tamu baru sudah ditambahkan.");
    });
  }

  async function updateGuest(guest: SerializedGuest) {
    startTransition(async () => {
      setGuestStatus("");
      const response = await fetch(`/api/admin/guests/${guest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(guest)
      });

      if (!response.ok) {
        setGuestStatus("Perubahan tamu belum tersimpan.");
        return;
      }

      const data = (await response.json()) as { guest: SerializedGuest };
      setGuests((current) => current.map((item) => (item.id === data.guest.id ? data.guest : item)));
      setGuestStatus("Data tamu berhasil diperbarui.");
    });
  }

  async function deleteGuest(id: string) {
    startTransition(async () => {
      setGuestStatus("");
      const response = await fetch(`/api/admin/guests/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setGuestStatus("Tamu belum berhasil dihapus.");
        return;
      }

      setGuests((current) => current.filter((item) => item.id !== id));
      setGuestStatus("Tamu berhasil dihapus.");
    });
  }

  async function deleteGuestbookEntry(id: string) {
    startTransition(async () => {
      setGuestbookStatus("");
      const response = await fetch(`/api/admin/guestbook/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setGuestbookStatus("Ucapan belum berhasil dihapus.");
        return;
      }

      setGuestbookEntries((current) => current.filter((item) => item.id !== id));
      setGuestbookStatus("Ucapan berhasil dihapus.");
    });
  }

  function beginUpload(target: ImageUploadTarget, file: File, caption = "") {
    const previewUrl = URL.createObjectURL(file);
    setCropDraft({
      target,
      file,
      previewUrl,
      caption
    });
  }

  function clearCropDraft() {
    setCropDraft((current) => {
      if (current) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
  }

  async function uploadMedia(target: UploadTarget, file: File, caption = "") {
    startTransition(async () => {
      setUploadStatus("");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target", target);
      formData.append("caption", caption);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        setUploadStatus("Upload belum berhasil.");
        return;
      }

      const data = (await response.json()) as {
        settings?: SerializedSettings;
        galleryItem?: SerializedGalleryItem;
      };

      if (data.settings) {
        setSettings(data.settings);
      }

      const galleryItem = data.galleryItem;

      if (galleryItem) {
        setSettings((current) => ({
          ...current,
          galleryItems: [...current.galleryItems, galleryItem].sort(
            (left, right) => left.sortOrder - right.sortOrder
          )
        }));
      }

      setGalleryCaption("");
      setUploadStatus("Media berhasil diunggah.");
      router.refresh();
    });
  }

  async function removeGalleryItem(id: string) {
    startTransition(async () => {
      setUploadStatus("");
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setUploadStatus("Foto galeri belum berhasil dihapus.");
        return;
      }

      setSettings((current) => ({
        ...current,
        galleryItems: current.galleryItems.filter((item) => item.id !== id)
      }));
      setUploadStatus("Foto galeri berhasil dihapus.");
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });
    router.push("/admin/login");
    router.refresh();
  }

  function buildInvitationLink(slug: string) {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/invitation/${slug}`;
  }

  function fillWhatsappTemplate(template: string, guest: SerializedGuest) {
    return template
      .replaceAll("{name}", guest.name)
      .replaceAll("{link}", buildInvitationLink(guest.slug))
      .replaceAll("{eventTitle}", settings.eventTitle)
      .replaceAll("{brideName}", settings.brideName)
      .replaceAll("{groomName}", settings.groomName)
      .replaceAll("{venueName}", settings.venueName)
      .replaceAll("{eventDate}", formatDateTimeId(settings.eventDate));
  }

  function buildWhatsappLink(guest: SerializedGuest) {
    const message = fillWhatsappTemplate(settings.whatsappMessageTemplate, guest);
    return `https://api.whatsapp.com/send?phone=${guest.phone.replace(/\D/g, "")}&text=${encodeURIComponent(message)}`;
  }

  async function copyInvitationLink(slug: string, guestName: string) {
    const invitationLink = buildInvitationLink(slug);
    await navigator.clipboard.writeText(invitationLink);
    setGuestStatus(`Link untuk ${guestName} sudah disalin.`);
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-stone-900 text-stone-100">
          <div className="grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-stone-400">Admin Dashboard</p>
              <h1 className="mt-3 font-cormorant text-5xl font-semibold leading-none md:text-7xl">
                Kelola undangan lamaran secara penuh.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
                Kontrol tamu, kirim WhatsApp, pilih template warna, atur musik, ganti foto, dan
                rapikan pesan tamu langsung dari panel ini.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/invitation/public" className="btn-primary">
                  Preview Publik
                </a>
                <button type="button" onClick={logout} className="btn-soft">
                  Logout
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Total Tamu", value: stats.invited },
                { label: "RSVP Hadir", value: stats.hadir },
                { label: "Tidak Hadir", value: stats.tidakHadir },
                { label: "Estimasi Kursi", value: stats.totalKursi }
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-stone-400">{item.label}</p>
                  <p className="mt-2 text-4xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="admin-card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Konten Utama</p>
                  <h2 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
                    Isi Undangan
                  </h2>
                </div>
                <button type="button" className="btn-primary" onClick={saveSettings} disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Nama Calon Perempuan</label>
                  <input
                    className="field-input"
                    value={settings.brideName}
                    onChange={(event) => updateSettings("brideName", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Nama Calon Laki-laki</label>
                  <input
                    className="field-input"
                    value={settings.groomName}
                    onChange={(event) => updateSettings("groomName", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Judul Acara</label>
                  <input
                    className="field-input"
                    value={settings.eventTitle}
                    onChange={(event) => updateSettings("eventTitle", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Tanggal Acara</label>
                  <input
                    className="field-input"
                    type="datetime-local"
                    value={settings.eventDate.slice(0, 16)}
                    onChange={(event) =>
                      updateSettings("eventDate", new Date(event.target.value).toISOString())
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Label Waktu</label>
                  <input
                    className="field-input"
                    value={settings.eventTimeLabel}
                    onChange={(event) => updateSettings("eventTimeLabel", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Lokasi</label>
                  <input
                    className="field-input"
                    value={settings.venueName}
                    onChange={(event) => updateSettings("venueName", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Alamat Venue</label>
                  <textarea
                    className="field-input"
                    rows={3}
                    value={settings.venueAddress}
                    onChange={(event) => updateSettings("venueAddress", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Google Maps Link</label>
                  <input
                    className="field-input"
                    value={settings.googleMapsUrl}
                    onChange={(event) => updateSettings("googleMapsUrl", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Maps Embed URL</label>
                  <input
                    className="field-input"
                    value={settings.mapEmbedUrl || ""}
                    onChange={(event) => updateSettings("mapEmbedUrl", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Headline Hero</label>
                  <textarea
                    className="field-input"
                    rows={3}
                    value={settings.heroHeadline}
                    onChange={(event) => updateSettings("heroHeadline", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Pesan Pembuka</label>
                  <textarea
                    className="field-input"
                    rows={3}
                    value={settings.introMessage}
                    onChange={(event) => updateSettings("introMessage", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Quote</label>
                  <textarea
                    className="field-input"
                    rows={2}
                    value={settings.quoteText}
                    onChange={(event) => updateSettings("quoteText", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Judul Story</label>
                  <input
                    className="field-input"
                    value={settings.storyTitle}
                    onChange={(event) => updateSettings("storyTitle", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Layout Style</label>
                  <select
                    className="field-input"
                    value={settings.layoutStyle}
                    onChange={(event) => markThemeCustom("layoutStyle", event.target.value)}
                  >
                    <option value="editorial">Editorial</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Story</label>
                  <textarea
                    className="field-input"
                    rows={5}
                    value={settings.storyText}
                    onChange={(event) => updateSettings("storyText", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Judul Countdown</label>
                  <input
                    className="field-input"
                    value={settings.countdownTitle}
                    onChange={(event) => updateSettings("countdownTitle", event.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Judul RSVP</label>
                  <input
                    className="field-input"
                    value={settings.rsvpTitle}
                    onChange={(event) => updateSettings("rsvpTitle", event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Judul Guestbook</label>
                  <input
                    className="field-input"
                    value={settings.guestbookTitle}
                    onChange={(event) => updateSettings("guestbookTitle", event.target.value)}
                  />
                </div>
              </div>

              {status ? <p className="mt-4 text-sm text-stone-600">{status}</p> : null}
            </div>

            <div className="admin-card">
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Theme Customizer</p>
              <h2 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
                Template Palette + Custom
              </h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Anda bisa pilih template warna siap pakai atau ubah satu per satu secara custom.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {themePresets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyThemePreset(preset.key)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      settings.themePreset === preset.key
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 text-stone-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{preset.name}</p>
                        <p
                          className={`mt-1 text-xs uppercase tracking-[0.2em] ${
                            settings.themePreset === preset.key ? "text-stone-300" : "text-stone-500"
                          }`}
                        >
                          {preset.mood}
                        </p>
                      </div>
                      <span className="rounded-full border border-current px-3 py-1 text-xs">
                        Pakai
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {[
                        preset.primaryColor,
                        preset.secondaryColor,
                        preset.accentColor,
                        preset.backgroundColor
                      ].map((color) => (
                        <span
                          key={color}
                          className="h-8 w-8 rounded-full border border-white/40"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["primaryColor", "Primary Color"],
                  ["secondaryColor", "Secondary Color"],
                  ["accentColor", "Accent Color"],
                  ["backgroundColor", "Background Color"],
                  ["surfaceColor", "Surface Color"]
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="field-label">{label}</label>
                    <input
                      type="color"
                      className="field-input h-14 p-2"
                      value={settings[key as keyof SerializedSettings] as string}
                      onChange={(event) =>
                        markThemeCustom(key as keyof SerializedSettings, event.target.value as never)
                      }
                    />
                  </div>
                ))}
                <div>
                  <label className="field-label">Font</label>
                  <select
                    className="field-input"
                    value={settings.fontKey}
                    onChange={(event) => markThemeCustom("fontKey", event.target.value)}
                  >
                    <option value="cormorant">Cormorant Garamond</option>
                    <option value="playfair">Playfair Display</option>
                    <option value="jakarta">Plus Jakarta Sans</option>
                    <option value="manrope">Manrope</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] p-6 text-stone-900" style={{ background: settings.secondaryColor }}>
                <p className="text-sm uppercase tracking-[0.25em] text-stone-600">Preview Tone</p>
                <p className="mt-3 font-cormorant text-4xl font-semibold">
                  {settings.brideName} & {settings.groomName}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-700">
                  Mode: {activePreset ? activePreset.name : "Custom"} • Font: {settings.fontKey} • Layout:{" "}
                  {getLayoutLabel(settings.layoutStyle)}
                </p>
              </div>
            </div>

            <div className="admin-card">
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Mood & Music</p>
              <h2 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
                Suasana Undangan
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4">
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-stone-700">
                      Aktifkan musik latar di undangan
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showMusic}
                      onChange={(event) => updateSettings("showMusic", event.target.checked)}
                    />
                  </label>
                </div>
                <div>
                  <label className="field-label">Judul Musik</label>
                  <input
                    className="field-input"
                    value={settings.musicTitle || ""}
                    onChange={(event) => updateSettings("musicTitle", event.target.value)}
                    placeholder="Romantic Background"
                  />
                </div>
                <div>
                  <label className="field-label">Mulai Dari Detik</label>
                  <input
                    type="number"
                    min={0}
                    className="field-input"
                    value={settings.musicStartSeconds}
                    onChange={(event) =>
                      updateSettings("musicStartSeconds", Number(event.target.value || 0))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Upload File Audio Lokal</label>
                  <input
                    type="file"
                    accept="audio/*"
                    className="field-input"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadMedia("musicUrl", file);
                      }
                    }}
                  />
                </div>
              </div>
              {settings.musicUrl ? (
                <div className="mt-4 rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
                  File aktif: {settings.musicUrl}
                </div>
              ) : null}
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Musik akan diputar dari file lokal yang Anda upload. Ini lebih stabil dibanding
                link eksternal karena file diambil langsung dari storage aplikasi.
              </p>

              <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                <label className="field-label">Template Pesan WhatsApp</label>
                <textarea
                  className="field-input min-h-[180px]"
                  value={settings.whatsappMessageTemplate}
                  onChange={(event) => updateSettings("whatsappMessageTemplate", event.target.value)}
                />
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Placeholder yang tersedia: {"{name}"}, {"{link}"}, {"{eventTitle}"},{" "}
                  {"{brideName}"}, {"{groomName}"}, {"{venueName}"}, {"{eventDate}"}.
                </p>
              </div>
            </div>

            <div className="admin-card">
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Section Visibility</p>
              <h2 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
                Show / Hide Segment
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["showHero", "Hero"],
                  ["showEventDetails", "Event Details"],
                  ["showLocation", "Location"],
                  ["showGallery", "Gallery"],
                  ["showStory", "Story"],
                  ["showCountdown", "Countdown"],
                  ["showRsvp", "RSVP"],
                  ["showGuestbook", "Guestbook"]
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4"
                  >
                    <span className="text-sm font-semibold text-stone-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[key as keyof SerializedSettings])}
                      onChange={(event) =>
                        updateSettings(key as keyof SerializedSettings, event.target.checked as never)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="admin-card">
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Media Upload</p>
              <h2 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">Foto & Visual</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["showBackgroundImage", "Tampilkan background image"],
                  ["showHeroPhoto", "Tampilkan foto hero awal"],
                  ["showEnvelopePhoto", "Tampilkan foto di amplop"]
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4"
                  >
                    <span className="text-sm font-semibold text-stone-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[key as keyof SerializedSettings])}
                      onChange={(event) =>
                        updateSettings(key as keyof SerializedSettings, event.target.checked as never)
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 space-y-5">
                {[
                  ["coverImageUrl", "Cover Photo"],
                  ["backgroundImageUrl", "Background Photo"],
                  ["envelopeImageUrl", "Envelope Photo"]
                ].map(([target, label]) => (
                  <label key={target} className="block rounded-[1.5rem] border border-dashed border-stone-300 p-4">
                    <span className="field-label">{label}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="field-input"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          beginUpload(
                            target as "coverImageUrl" | "backgroundImageUrl" | "envelopeImageUrl",
                            file
                          );
                        }
                      }}
                    />
                  </label>
                ))}

                <div className="rounded-[1.5rem] border border-dashed border-stone-300 p-4">
                  <label className="field-label">Tambah Galeri</label>
                  <input
                    type="text"
                    className="field-input mb-3"
                    placeholder="Caption foto"
                    value={galleryCaption}
                    onChange={(event) => setGalleryCaption(event.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="field-input"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          beginUpload("gallery", file, galleryCaption);
                        }
                      }}
                    />
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-600">
                  Setelah memilih file, admin akan melihat preview crop dengan grid sebelum gambar
                  disimpan. Jadi hasil yang tampil di undangan akan lebih dekat dengan preview final.
                </div>
              </div>

              {uploadStatus ? <p className="mt-4 text-sm text-stone-600">{uploadStatus}</p> : null}

              <div className="mt-6 space-y-4">
                {settings.galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4"
                  >
                    <img src={item.imageUrl} alt={item.caption || "Galeri"} className="h-48 w-full rounded-[1.2rem] object-cover" />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">
                          {item.caption || "Tanpa caption"}
                        </p>
                        <p className="text-xs text-stone-500">Urutan {item.sortOrder}</p>
                      </div>
                      <button type="button" className="btn-soft" onClick={() => removeGalleryItem(item.id)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">RSVP Dashboard</p>
              <h2 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">Aktivitas Tamu</h2>
              <div className="mt-6 space-y-3">
                {rsvps.length ? (
                  rsvps.map((item) => (
                    <article key={item.id} className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-stone-900">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">
                            {item.attendance === "HADIR" ? "Hadir" : "Tidak Hadir"} • {item.guestCount} orang
                          </p>
                        </div>
                        <p className="text-xs text-stone-500">{formatDateTimeId(item.createdAt)}</p>
                      </div>
                      {item.message ? <p className="mt-3 text-sm leading-7 text-stone-600">{item.message}</p> : null}
                    </article>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-600">
                    Belum ada RSVP yang masuk.
                  </div>
                )}
              </div>
            </div>

            <div className="admin-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Guestbook</p>
                  <h2 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
                    Ucapan Terkini
                  </h2>
                </div>
                <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600">
                  {guestbookEntries.length} pesan
                </span>
              </div>
              {guestbookStatus ? <p className="mt-4 text-sm text-stone-600">{guestbookStatus}</p> : null}
              <div className="mt-6 space-y-3">
                {guestbookEntries.length ? (
                  guestbookEntries.map((item) => (
                    <article key={item.id} className="rounded-[1.4rem] border border-stone-200 bg-stone-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-stone-900">{item.name}</p>
                          <p className="mt-1 text-xs text-stone-500">{formatDateTimeId(item.createdAt)}</p>
                        </div>
                        <button
                          type="button"
                          className="btn-soft"
                          onClick={() => deleteGuestbookEntry(item.id)}
                        >
                          Hapus
                        </button>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{item.message}</p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-600">
                    Belum ada ucapan yang masuk.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Guest Management</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-cormorant text-4xl font-semibold text-stone-900">Tamu & WhatsApp</h2>
            <p className="text-sm text-stone-500">
              Link undangan dibuat personal berdasarkan slug tamu.
            </p>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1.2fr_auto]" onSubmit={createGuest}>
            <input
              className="field-input"
              placeholder="Nama tamu"
              value={guestForm.name}
              onChange={(event) => setGuestForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="Nomor WhatsApp"
              value={guestForm.phone}
              onChange={(event) => setGuestForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <input
              className="field-input"
              placeholder="Catatan"
              value={guestForm.note}
              onChange={(event) => setGuestForm((current) => ({ ...current, note: event.target.value }))}
            />
            <button type="submit" className="btn-primary" disabled={isPending}>
              Tambah Tamu
            </button>
          </form>

          {guestStatus ? <p className="mt-4 text-sm text-stone-600">{guestStatus}</p> : null}

          <div className="mt-6 space-y-4">
            {guests.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                onSave={updateGuest}
                onDelete={deleteGuest}
                onCopy={copyInvitationLink}
                buildInvitationLink={buildInvitationLink}
                buildWhatsappLink={buildWhatsappLink}
              />
            ))}
          </div>
        </section>
      </div>

      {cropDraft ? (
        <ImageCropModal
          draft={cropDraft}
          onCancel={clearCropDraft}
          onConfirm={async (file) => {
            await uploadMedia(cropDraft.target, file, cropDraft.caption);
            clearCropDraft();
          }}
        />
      ) : null}
    </main>
  );
}

type GuestRowProps = {
  guest: SerializedGuest;
  onSave: (guest: SerializedGuest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCopy: (slug: string, guestName: string) => Promise<void>;
  buildInvitationLink: (slug: string) => string;
  buildWhatsappLink: (guest: SerializedGuest) => string;
};

function GuestRow({
  guest,
  onSave,
  onDelete,
  onCopy,
  buildInvitationLink,
  buildWhatsappLink
}: GuestRowProps) {
  const [draft, setDraft] = useState(guest);

  useEffect(() => {
    setDraft(guest);
  }, [guest]);

  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <input
          className="field-input"
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          className="field-input"
          value={draft.phone}
          onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
        />
        <input
          className="field-input"
          value={draft.note || ""}
          placeholder="Catatan"
          onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
        />
        <input
          className="field-input"
          value={draft.slug}
          placeholder="Slug tamu"
          onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
        />
        <button type="button" className="btn-primary" onClick={() => void onSave(draft)}>
          Simpan
        </button>
      </div>

      <div className="mt-4 rounded-[1.2rem] bg-white p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Slug</p>
        <p className="mt-2 break-all text-sm font-semibold text-stone-800">{guest.slug}</p>
        <p className="mt-3 break-all text-sm leading-7 text-stone-600">
          {buildInvitationLink(guest.slug)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-soft" onClick={() => void onCopy(guest.slug, draft.name)}>
          Copy Link
        </button>
        <a href={buildWhatsappLink(draft)} target="_blank" rel="noreferrer" className="btn-soft">
          Send via WhatsApp
        </a>
        <button type="button" className="btn-soft" onClick={() => void onDelete(guest.id)}>
          Hapus
        </button>
      </div>
    </article>
  );
}

type CropSpec = {
  label: string;
  aspectRatio: number;
  outputWidth: number;
  outputHeight: number;
};

const cropSpecs: Record<ImageUploadTarget, CropSpec> = {
  coverImageUrl: {
    label: "Crop Cover",
    aspectRatio: 4 / 5,
    outputWidth: 1200,
    outputHeight: 1500
  },
  backgroundImageUrl: {
    label: "Crop Background",
    aspectRatio: 16 / 9,
    outputWidth: 1600,
    outputHeight: 900
  },
  envelopeImageUrl: {
    label: "Crop Amplop",
    aspectRatio: 4 / 3,
    outputWidth: 1200,
    outputHeight: 900
  },
  gallery: {
    label: "Crop Gallery",
    aspectRatio: 1,
    outputWidth: 1200,
    outputHeight: 1200
  }
};

function ImageCropModal({
  draft,
  onCancel,
  onConfirm
}: {
  draft: CropDraft;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void>;
}) {
  const spec = cropSpecs[draft.target];
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 320, height: 320 / spec.aspectRatio });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const dragState = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setViewportSize({
        width: rect.width,
        height: rect.height
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const renderScale = useMemo(() => {
    if (!imageElement) return 1;
    const coverScale = Math.max(
      viewportSize.width / imageElement.naturalWidth,
      viewportSize.height / imageElement.naturalHeight
    );
    return coverScale * zoom;
  }, [imageElement, viewportSize.height, viewportSize.width, zoom]);

  const renderedSize = useMemo(() => {
    if (!imageElement) {
      return { width: viewportSize.width, height: viewportSize.height };
    }

    return {
      width: imageElement.naturalWidth * renderScale,
      height: imageElement.naturalHeight * renderScale
    };
  }, [imageElement, renderScale, viewportSize.height, viewportSize.width]);

  function clampPosition(nextX: number, nextY: number) {
    const minX = Math.min(0, viewportSize.width - renderedSize.width);
    const minY = Math.min(0, viewportSize.height - renderedSize.height);

    return {
      x: Math.min(0, Math.max(minX, nextX)),
      y: Math.min(0, Math.max(minY, nextY))
    };
  }

  useEffect(() => {
    if (!imageElement) return;

    const centered = clampPosition(
      (viewportSize.width - renderedSize.width) / 2,
      (viewportSize.height - renderedSize.height) / 2
    );
    setPosition(centered);
  }, [imageElement, renderedSize.height, renderedSize.width, viewportSize.height, viewportSize.width]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;
    setPosition(clampPosition(dragState.current.originX + deltaX, dragState.current.originY + deltaY));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragState.current?.pointerId === event.pointerId) {
      dragState.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function handleConfirm() {
    if (!imageElement) return;

    setIsSaving(true);

    const sourceX = Math.max(0, -position.x / renderScale);
    const sourceY = Math.max(0, -position.y / renderScale);
    const sourceWidth = viewportSize.width / renderScale;
    const sourceHeight = viewportSize.height / renderScale;

    const canvas = document.createElement("canvas");
    canvas.width = spec.outputWidth;
    canvas.height = spec.outputHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      setIsSaving(false);
      return;
    }

    context.drawImage(
      imageElement,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      spec.outputWidth,
      spec.outputHeight
    );

    const mimeType = draft.file.type || "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((nextBlob) => resolve(nextBlob), mimeType, 0.92)
    );

    if (!blob) {
      setIsSaving(false);
      return;
    }

    const croppedFile = new File([blob], draft.file.name, {
      type: mimeType
    });

    await onConfirm(croppedFile);
    setIsSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white p-4 shadow-2xl md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">{spec.label}</p>
            <h3 className="mt-2 font-cormorant text-4xl font-semibold text-stone-900">
              Atur Area Gambar
            </h3>
          </div>
          <button type="button" className="btn-soft" onClick={onCancel} disabled={isSaving}>
            Batal
          </button>
        </div>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          Geser gambar di dalam frame dan atur zoom. Area di dalam grid adalah hasil yang akan tampil
          di undangan.
        </p>

        <div className="mt-6 rounded-[1.75rem] bg-stone-100 p-3 md:p-5">
          <div
            ref={viewportRef}
            className="relative mx-auto w-full max-w-[540px] overflow-hidden rounded-[1.5rem] bg-stone-200"
            style={{ aspectRatio: `${spec.aspectRatio}` } as CSSProperties}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              src={draft.previewUrl}
              alt="Crop preview"
              className="absolute select-none"
              draggable={false}
              onLoad={(event) => setImageElement(event.currentTarget)}
              style={{
                left: position.x,
                top: position.y,
                width: renderedSize.width,
                height: renderedSize.height
              }}
            />
            <div className="pointer-events-none absolute inset-0 border-[10px] border-black/18" />
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="border border-white/40" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Zoom: {zoom.toFixed(2)}x</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="btn-soft" onClick={onCancel} disabled={isSaving}>
            Tutup
          </button>
          <button type="button" className="btn-primary" onClick={() => void handleConfirm()} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Gunakan Crop Ini"}
          </button>
        </div>
      </div>
    </div>
  );
}

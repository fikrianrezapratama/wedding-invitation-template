import { prisma } from "@/lib/prisma";
import { defaultGallery, defaultSettings } from "@/lib/defaults";
import type { AdminDashboardData, SerializedSettings } from "@/types";

export async function ensureSettings() {
  const settings = await prisma.invitationSettings.findUnique({
    where: { id: 1 },
    include: {
      galleryItems: {
        orderBy: {
          sortOrder: "asc"
        }
      }
    }
  });

  if (settings) {
    return settings;
  }

  return prisma.invitationSettings.create({
    data: {
      id: 1,
      brideName: defaultSettings.brideName,
      groomName: defaultSettings.groomName,
      eventTitle: defaultSettings.eventTitle,
      eventDate: new Date(defaultSettings.eventDate),
      eventTimeLabel: defaultSettings.eventTimeLabel,
      venueName: defaultSettings.venueName,
      venueAddress: defaultSettings.venueAddress,
      googleMapsUrl: defaultSettings.googleMapsUrl,
      mapEmbedUrl: defaultSettings.mapEmbedUrl,
      heroHeadline: defaultSettings.heroHeadline,
      introMessage: defaultSettings.introMessage,
      quoteText: defaultSettings.quoteText,
      storyTitle: defaultSettings.storyTitle,
      storyText: defaultSettings.storyText,
      countdownTitle: defaultSettings.countdownTitle,
      rsvpTitle: defaultSettings.rsvpTitle,
      guestbookTitle: defaultSettings.guestbookTitle,
      primaryColor: defaultSettings.primaryColor,
      secondaryColor: defaultSettings.secondaryColor,
      accentColor: defaultSettings.accentColor,
      backgroundColor: defaultSettings.backgroundColor,
      surfaceColor: defaultSettings.surfaceColor,
      themePreset: defaultSettings.themePreset,
      fontKey: defaultSettings.fontKey,
      layoutStyle: defaultSettings.layoutStyle,
      showHero: defaultSettings.showHero,
      showEventDetails: defaultSettings.showEventDetails,
      showLocation: defaultSettings.showLocation,
      showGallery: defaultSettings.showGallery,
      showStory: defaultSettings.showStory,
      showCountdown: defaultSettings.showCountdown,
      showRsvp: defaultSettings.showRsvp,
      showGuestbook: defaultSettings.showGuestbook,
      showMusic: defaultSettings.showMusic,
      showBackgroundImage: defaultSettings.showBackgroundImage,
      showHeroPhoto: defaultSettings.showHeroPhoto,
      showEnvelopePhoto: defaultSettings.showEnvelopePhoto,
      musicUrl: defaultSettings.musicUrl || null,
      musicTitle: defaultSettings.musicTitle || null,
      musicStartSeconds: defaultSettings.musicStartSeconds,
      whatsappMessageTemplate: defaultSettings.whatsappMessageTemplate,
      coverImageUrl: defaultSettings.coverImageUrl,
      coverImageFocusX: defaultSettings.coverImageFocusX,
      coverImageFocusY: defaultSettings.coverImageFocusY,
      backgroundImageUrl: defaultSettings.backgroundImageUrl,
      backgroundImageFocusX: defaultSettings.backgroundImageFocusX,
      backgroundImageFocusY: defaultSettings.backgroundImageFocusY,
      envelopeImageUrl: defaultSettings.envelopeImageUrl,
      envelopeImageFocusX: defaultSettings.envelopeImageFocusX,
      envelopeImageFocusY: defaultSettings.envelopeImageFocusY,
      galleryItems: {
        create: defaultGallery.map((item) => ({
          imageUrl: item.imageUrl,
          caption: item.caption,
          sortOrder: item.sortOrder
        }))
      }
    },
    include: {
      galleryItems: {
        orderBy: {
          sortOrder: "asc"
        }
      }
    }
  });
}

export function serializeSettings(
  settings: Awaited<ReturnType<typeof ensureSettings>>
): SerializedSettings {
  return {
    id: settings.id,
    brideName: settings.brideName,
    groomName: settings.groomName,
    eventTitle: settings.eventTitle,
    eventDate: settings.eventDate.toISOString(),
    eventTimeLabel: settings.eventTimeLabel,
    venueName: settings.venueName,
    venueAddress: settings.venueAddress,
    googleMapsUrl: settings.googleMapsUrl,
    mapEmbedUrl: settings.mapEmbedUrl,
    heroHeadline: settings.heroHeadline,
    introMessage: settings.introMessage,
    quoteText: settings.quoteText,
    storyTitle: settings.storyTitle,
    storyText: settings.storyText,
    countdownTitle: settings.countdownTitle,
    rsvpTitle: settings.rsvpTitle,
    guestbookTitle: settings.guestbookTitle,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    backgroundColor: settings.backgroundColor,
    surfaceColor: settings.surfaceColor,
    themePreset: settings.themePreset,
    fontKey: settings.fontKey,
    layoutStyle: settings.layoutStyle,
    showHero: settings.showHero,
    showEventDetails: settings.showEventDetails,
    showLocation: settings.showLocation,
    showGallery: settings.showGallery,
    showStory: settings.showStory,
    showCountdown: settings.showCountdown,
    showRsvp: settings.showRsvp,
    showGuestbook: settings.showGuestbook,
    showMusic: settings.showMusic,
    showBackgroundImage: settings.showBackgroundImage,
    showHeroPhoto: settings.showHeroPhoto,
    showEnvelopePhoto: settings.showEnvelopePhoto,
    musicUrl: settings.musicUrl,
    musicTitle: settings.musicTitle,
    musicStartSeconds: settings.musicStartSeconds,
    whatsappMessageTemplate: settings.whatsappMessageTemplate,
    coverImageUrl: settings.coverImageUrl,
    coverImageFocusX: settings.coverImageFocusX,
    coverImageFocusY: settings.coverImageFocusY,
    backgroundImageUrl: settings.backgroundImageUrl,
    backgroundImageFocusX: settings.backgroundImageFocusX,
    backgroundImageFocusY: settings.backgroundImageFocusY,
    envelopeImageUrl: settings.envelopeImageUrl,
    envelopeImageFocusX: settings.envelopeImageFocusX,
    envelopeImageFocusY: settings.envelopeImageFocusY,
    galleryItems: settings.galleryItems.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      caption: item.caption,
      sortOrder: item.sortOrder
    }))
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [settings, guests, rsvps, guestbookEntries] = await Promise.all([
    ensureSettings(),
    prisma.guest.findMany({
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.rSVP.findMany({
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.guestbookEntry.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);

  return {
    settings: serializeSettings(settings),
    guests: guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      phone: guest.phone,
      slug: guest.slug,
      note: guest.note,
      createdAt: guest.createdAt.toISOString()
    })),
    rsvps: rsvps.map((item) => ({
      id: item.id,
      name: item.name,
      attendance: item.attendance,
      guestCount: item.guestCount,
      message: item.message,
      invitationSlug: item.invitationSlug,
      createdAt: item.createdAt.toISOString()
    })),
    guestbookEntries: guestbookEntries.map((item) => ({
      id: item.id,
      name: item.name,
      message: item.message,
      invitationSlug: item.invitationSlug,
      createdAt: item.createdAt.toISOString()
    }))
  };
}

import { NextRequest, NextResponse } from "next/server";
import { ensureSettings, serializeSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/session";
import type { SerializedSettings } from "@/types";

function isAuthorized(request: NextRequest) {
  return verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSettings();
  const body = (await request.json()) as SerializedSettings;

  const settings = await prisma.invitationSettings.update({
    where: { id: 1 },
    data: {
      brideName: body.brideName,
      groomName: body.groomName,
      eventTitle: body.eventTitle,
      eventDate: new Date(body.eventDate),
      eventTimeLabel: body.eventTimeLabel,
      venueName: body.venueName,
      venueAddress: body.venueAddress,
      googleMapsUrl: body.googleMapsUrl,
      mapEmbedUrl: body.mapEmbedUrl || null,
      heroHeadline: body.heroHeadline,
      introMessage: body.introMessage,
      quoteText: body.quoteText,
      storyTitle: body.storyTitle,
      storyText: body.storyText,
      countdownTitle: body.countdownTitle,
      rsvpTitle: body.rsvpTitle,
      guestbookTitle: body.guestbookTitle,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      backgroundColor: body.backgroundColor,
      surfaceColor: body.surfaceColor,
      themePreset: body.themePreset,
      fontKey: body.fontKey,
      layoutStyle: body.layoutStyle,
      showHero: body.showHero,
      showEventDetails: body.showEventDetails,
      showLocation: body.showLocation,
      showGallery: body.showGallery,
      showStory: body.showStory,
      showCountdown: body.showCountdown,
      showRsvp: body.showRsvp,
      showGuestbook: body.showGuestbook,
      showMusic: body.showMusic,
      showBackgroundImage: body.showBackgroundImage,
      showHeroPhoto: body.showHeroPhoto,
      showEnvelopePhoto: body.showEnvelopePhoto,
      musicUrl: body.musicUrl || null,
      musicTitle: body.musicTitle || null,
      musicStartSeconds: body.musicStartSeconds,
      whatsappMessageTemplate: body.whatsappMessageTemplate,
      coverImageFocusX: body.coverImageFocusX,
      coverImageFocusY: body.coverImageFocusY,
      backgroundImageFocusX: body.backgroundImageFocusX,
      backgroundImageFocusY: body.backgroundImageFocusY,
      envelopeImageFocusX: body.envelopeImageFocusX,
      envelopeImageFocusY: body.envelopeImageFocusY
    },
    include: {
      galleryItems: {
        orderBy: {
          sortOrder: "asc"
        }
      }
    }
  });

  return NextResponse.json({
    settings: serializeSettings(settings)
  });
}

export type AttendanceValue = "HADIR" | "TIDAK_HADIR";

export type SerializedGalleryItem = {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
};

export type SerializedSettings = {
  id: number;
  brideName: string;
  groomName: string;
  eventTitle: string;
  eventDate: string;
  eventTimeLabel: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  mapEmbedUrl: string | null;
  heroHeadline: string;
  introMessage: string;
  quoteText: string;
  storyTitle: string;
  storyText: string;
  countdownTitle: string;
  rsvpTitle: string;
  guestbookTitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  themePreset: string;
  fontKey: string;
  layoutStyle: string;
  showHero: boolean;
  showEventDetails: boolean;
  showLocation: boolean;
  showGallery: boolean;
  showStory: boolean;
  showCountdown: boolean;
  showRsvp: boolean;
  showGuestbook: boolean;
  showMusic: boolean;
  showBackgroundImage: boolean;
  showHeroPhoto: boolean;
  showEnvelopePhoto: boolean;
  musicUrl: string | null;
  musicTitle: string | null;
  musicStartSeconds: number;
  whatsappMessageTemplate: string;
  coverImageUrl: string | null;
  coverImageFocusX: number;
  coverImageFocusY: number;
  backgroundImageUrl: string | null;
  backgroundImageFocusX: number;
  backgroundImageFocusY: number;
  envelopeImageUrl: string | null;
  envelopeImageFocusX: number;
  envelopeImageFocusY: number;
  galleryItems: SerializedGalleryItem[];
};

export type SerializedGuest = {
  id: string;
  name: string;
  phone: string;
  slug: string;
  note: string | null;
  createdAt: string;
};

export type SerializedRsvp = {
  id: string;
  name: string;
  attendance: AttendanceValue;
  guestCount: number;
  message: string | null;
  invitationSlug: string | null;
  createdAt: string;
};

export type SerializedGuestbookEntry = {
  id: string;
  name: string;
  message: string;
  invitationSlug: string | null;
  createdAt: string;
};

export type AdminDashboardData = {
  settings: SerializedSettings;
  guests: SerializedGuest[];
  rsvps: SerializedRsvp[];
  guestbookEntries: SerializedGuestbookEntry[];
};

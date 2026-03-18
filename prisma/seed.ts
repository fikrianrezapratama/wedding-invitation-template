import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.invitationSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      brideName: "Alya",
      groomName: "Fikri",
      eventTitle: "Acara Lamaran",
      eventDate: new Date("2026-06-21T10:00:00.000Z"),
      eventTimeLabel: "Minggu, 21 Juni 2026 • 17.00 WIB",
      venueName: "Grand Kemang Ballroom",
      venueAddress: "Jl. Kemang Raya No. 20, Jakarta Selatan",
      googleMapsUrl: "https://maps.google.com/?q=Grand+Kemang+Ballroom",
      mapEmbedUrl:
        "https://www.google.com/maps?q=Grand+Kemang+Ballroom&output=embed",
      heroHeadline: "Kami mengundang Anda untuk menyaksikan awal perjalanan kami.",
      introMessage:
        "Dengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara lamaran kami.",
      quoteText:
        "Setiap kisah baik dimulai dari niat yang tulus dan langkah yang dijaga bersama.",
      storyTitle: "Tentang Hari Ini",
      storyText:
        "Momen lamaran ini menjadi langkah awal yang ingin kami rayakan bersama keluarga, sahabat, dan orang-orang terdekat yang selama ini membersamai perjalanan kami.",
      countdownTitle: "Menuju Hari Bahagia",
      rsvpTitle: "Konfirmasi Kehadiran",
      guestbookTitle: "Ucapan & Doa",
      primaryColor: "#6F4E37",
      secondaryColor: "#E9D8C5",
      accentColor: "#B66A50",
      backgroundColor: "#F7F1E8",
      surfaceColor: "#FFF8F0",
      themePreset: "cinnamon-rose",
      fontKey: "cormorant",
      layoutStyle: "editorial",
      showHero: true,
      showEventDetails: true,
      showLocation: true,
      showGallery: true,
      showStory: true,
      showCountdown: true,
      showRsvp: true,
      showGuestbook: true,
      showMusic: false,
      showBackgroundImage: true,
      showHeroPhoto: true,
      showEnvelopePhoto: true,
      musicUrl: null,
      musicTitle: "Romantic Background",
      musicStartSeconds: 0,
      whatsappMessageTemplate:
        "Halo {name}, kami mengundang Anda ke acara lamaran kami.\n\nSilakan buka undangan berikut:\n{link}\n\nTerima kasih.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      coverImageFocusX: 50,
      coverImageFocusY: 50,
      backgroundImageUrl:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      backgroundImageFocusX: 50,
      backgroundImageFocusY: 50,
      envelopeImageUrl:
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
      envelopeImageFocusX: 50,
      envelopeImageFocusY: 50,
      galleryItems: {
        create: [
          {
            imageUrl:
              "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
            caption: "Sebuah awal yang kami jaga bersama",
            sortOrder: 1
          },
          {
            imageUrl:
              "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
            caption: "Momen sederhana yang berarti",
            sortOrder: 2
          },
          {
            imageUrl:
              "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
            caption: "Langkah menuju hari yang kami nantikan",
            sortOrder: 3
          }
        ]
      }
    }
  });

  await prisma.guest.upsert({
    where: { slug: "bapak-ahmad-demo" },
    update: {
      name: "Bapak Ahmad",
      phone: "6281234567890"
    },
    create: {
      name: "Bapak Ahmad",
      phone: "6281234567890",
      slug: "bapak-ahmad-demo"
    }
  });

  await prisma.guest.upsert({
    where: { slug: "mbak-rina-demo" },
    update: {
      name: "Mbak Rina",
      phone: "6289876543210"
    },
    create: {
      name: "Mbak Rina",
      phone: "6289876543210",
      slug: "mbak-rina-demo"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

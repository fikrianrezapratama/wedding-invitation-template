import { notFound } from "next/navigation";
import { InvitationExperience } from "@/components/public/InvitationExperience";
import { ensureSettings, serializeSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [settings, guestbookEntries, guest] = await Promise.all([
    ensureSettings(),
    prisma.guestbookEntry.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 8
    }),
    slug === "public"
      ? Promise.resolve(null)
      : prisma.guest.findUnique({
          where: {
            slug
          }
        })
  ]);

  if (slug !== "public" && !guest) {
    notFound();
  }

  const guestNameQuery = query.to;
  const guestName =
    slug === "public"
      ? typeof guestNameQuery === "string"
        ? guestNameQuery
        : "Bapak/Ibu/Saudara/i"
      : guest?.name || "Bapak/Ibu/Saudara/i";

  return (
    <InvitationExperience
      settings={serializeSettings(settings)}
      guestName={guestName}
      guestSlug={slug}
      guestbookEntries={guestbookEntries.map((entry) => ({
        id: entry.id,
        name: entry.name,
        message: entry.message,
        invitationSlug: entry.invitationSlug,
        createdAt: entry.createdAt.toISOString()
      }))}
    />
  );
}

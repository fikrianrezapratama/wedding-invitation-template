import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    attendance?: "HADIR" | "TIDAK_HADIR";
    guestCount?: number;
    message?: string;
  };

  const name = body.name?.trim();
  const attendance = body.attendance;

  if (!name || (attendance !== "HADIR" && attendance !== "TIDAK_HADIR")) {
    return NextResponse.json({ error: "Invalid RSVP" }, { status: 400 });
  }

  const guest =
    body.slug && body.slug !== "public"
      ? await prisma.guest.findUnique({
          where: {
            slug: body.slug
          }
        })
      : null;

  await prisma.rSVP.create({
    data: {
      guestId: guest?.id || null,
      invitationSlug: body.slug || null,
      name,
      attendance,
      guestCount: Math.max(1, Number(body.guestCount || 1)),
      message: body.message?.trim() || null
    }
  });

  return NextResponse.json({ ok: true });
}


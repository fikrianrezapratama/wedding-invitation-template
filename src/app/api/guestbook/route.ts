import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug?: string;
    name?: string;
    message?: string;
  };

  const name = body.name?.trim();
  const message = body.message?.trim();

  if (!name || !message) {
    return NextResponse.json({ error: "Invalid guestbook entry" }, { status: 400 });
  }

  const entry = await prisma.guestbookEntry.create({
    data: {
      name,
      message,
      invitationSlug: body.slug || null
    }
  });

  return NextResponse.json({
    entry: {
      id: entry.id,
      name: entry.name,
      message: entry.message,
      invitationSlug: entry.invitationSlug,
      createdAt: entry.createdAt.toISOString()
    }
  });
}


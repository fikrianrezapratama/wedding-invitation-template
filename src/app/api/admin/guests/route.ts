import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createGuestSlugBase } from "@/lib/slug";

function isAuthorized(request: NextRequest) {
  return verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    note?: string;
  };

  const name = body.name?.trim();
  const phone = body.phone?.trim();

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const baseSlug = createGuestSlugBase(name);
  let slug = baseSlug;
  let counter = 2;

  while (await prisma.guest.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const guest = await prisma.guest.create({
    data: {
      name,
      phone,
      slug,
      note: body.note?.trim() || null
    }
  });

  return NextResponse.json({
    guest: {
      id: guest.id,
      name: guest.name,
      phone: guest.phone,
      slug: guest.slug,
      note: guest.note,
      createdAt: guest.createdAt.toISOString()
    }
  });
}

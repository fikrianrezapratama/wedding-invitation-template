import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

function isAuthorized(request: NextRequest) {
  return verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    note?: string | null;
    slug?: string;
  };

  const nextSlug = slugify(body.slug || body.name || "");
  const existing = nextSlug
    ? await prisma.guest.findUnique({
        where: { slug: nextSlug }
      })
    : null;

  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const guest = await prisma.guest.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      phone: body.phone?.trim(),
      note: body.note?.trim() || null,
      slug: nextSlug || undefined
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await prisma.guest.delete({
    where: { id }
  });

  return NextResponse.json({ ok: true });
}

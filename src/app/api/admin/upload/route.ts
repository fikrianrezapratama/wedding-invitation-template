import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/session";
import { ensureSettings, serializeSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: NextRequest) {
  return verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const target = String(formData.get("target") || "");
  const caption = String(formData.get("caption") || "");

  if (!(file instanceof File) || !target) {
    return NextResponse.json({ error: "Invalid upload payload" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension =
    path.extname(file.name) || (target === "musicUrl" ? ".mp3" : ".jpg");
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, fileName), buffer);

  const assetUrl = `/uploads/${fileName}`;

  await ensureSettings();

  if (target === "gallery") {
    const lastGallery = await prisma.galleryItem.findFirst({
      orderBy: {
        sortOrder: "desc"
      }
    });

    const galleryItem = await prisma.galleryItem.create({
      data: {
        settingsId: 1,
        imageUrl: assetUrl,
        caption: caption || null,
        sortOrder: (lastGallery?.sortOrder || 0) + 1
      }
    });

    return NextResponse.json({
      galleryItem: {
        id: galleryItem.id,
        imageUrl: galleryItem.imageUrl,
        caption: galleryItem.caption,
        sortOrder: galleryItem.sortOrder
      }
    });
  }

  const settings = await prisma.invitationSettings.update({
    where: { id: 1 },
    data:
      target === "coverImageUrl"
        ? { coverImageUrl: assetUrl }
        : target === "backgroundImageUrl"
          ? { backgroundImageUrl: assetUrl }
          : target === "musicUrl"
            ? { musicUrl: assetUrl }
          : { envelopeImageUrl: assetUrl },
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

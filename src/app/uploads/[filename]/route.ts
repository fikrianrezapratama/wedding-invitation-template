import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

function getContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".jpeg":
    case ".jpg":
    default:
      return "image/jpeg";
  }
}

export async function GET(_: Request, context: RouteContext) {
  const { filename } = await context.params;
  const filePath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getContentType(filename),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

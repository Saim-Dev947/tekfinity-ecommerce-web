import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 8;

const IMAGE_TYPES: Record<string, { extension: string; signature: (bytes: Uint8Array) => boolean }> = {
  "image/jpeg": { extension: "jpg", signature: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extension: "png", signature: (b) => b.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10" },
  "image/webp": { extension: "webp", signature: (b) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP" },
  "image/avif": { extension: "avif", signature: (b) => String.fromCharCode(...b.slice(4, 12)).includes("ftypavif") },
  "image/gif": { extension: "gif", signature: (b) => ["GIF87a", "GIF89a"].includes(String.fromCharCode(...b.slice(0, 6))) },
};

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }

  try {
    const contentLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_TOTAL_SIZE + 1024 * 1024) {
      return NextResponse.json({ error: "The total upload size must be 20 MB or smaller" }, { status: 413 });
    }

    const form = await req.formData();
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    if (files.length === 0 || files.length > MAX_FILES) {
      return NextResponse.json({ error: `Choose between 1 and ${MAX_FILES} image files per upload` }, { status: 400 });
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      return NextResponse.json({ error: "Each image must be 5 MB or smaller" }, { status: 400 });
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) {
      return NextResponse.json({ error: "The total upload size must be 20 MB or smaller" }, { status: 400 });
    }

    const validatedFiles = [];
    for (const file of files) {
      const imageType = IMAGE_TYPES[file.type];
      if (!imageType) {
        return NextResponse.json({ error: `${file.name} is not a supported image format` }, { status: 400 });
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!imageType.signature(bytes)) {
        return NextResponse.json({ error: `${file.name} does not match its declared image format` }, { status: 400 });
      }
      validatedFiles.push({ file, imageType, bytes });
    }

    const client = createServiceClient();
    if (isSupabaseConfigured && !client) {
      return NextResponse.json({ error: "Product image storage needs SUPABASE_SERVICE_ROLE_KEY configured" }, { status: 503 });
    }

    const urls: string[] = [];
    for (const { file, imageType, bytes } of validatedFiles) {
      const objectPath = `${randomUUID()}.${imageType.extension}`;
      if (client) {
        const { error } = await client.storage.from("product-images").upload(objectPath, bytes, {
          contentType: file.type,
          upsert: false,
        });
        if (error) {
          console.error("Supabase product image upload failed", error);
          return NextResponse.json({ error: "Supabase upload failed. Check that the public product-images bucket exists." }, { status: 502 });
        }
        urls.push(client.storage.from("product-images").getPublicUrl(objectPath).data.publicUrl);
      } else {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, objectPath), bytes, { flag: "wx" });
        urls.push(`/uploads/${objectPath}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("Product image upload failed", error);
    return NextResponse.json({ error: "Could not upload product images" }, { status: 500 });
  }
}

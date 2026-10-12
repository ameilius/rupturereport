import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

/** Persistent upload storage outside the repo (survives git pull + build). */
export const UPLOADS_DIR = process.env.UPLOADS_DIR || "/home/rupturereport/uploads";
export const UPLOAD_KINDS = ["players", "teams"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const FILE_RE = /^[a-z0-9-]+-[a-f0-9]{12}\.png$/;

/** Identify PNG / JPEG / WebP by magic bytes; anything else is rejected. */
export function sniffImage(b: Buffer): "png" | "jpeg" | "webp" | null {
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

/**
 * Validate, normalise (re-encode to PNG, strip metadata, resize) and store an upload.
 * Returns the public path, e.g. /media/players/javon-hargrave-1a2b3c4d5e6f.png
 */
export async function storeUpload(kind: UploadKind, slug: string, file: File): Promise<string> {
  if (file.size === 0) throw new Error("Choose an image to upload");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 5 MB");
  const input = Buffer.from(await file.arrayBuffer());
  if (input.length > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 5 MB");
  if (!sniffImage(input)) throw new Error("Only PNG, JPG or WebP images are allowed");

  const sharp = (await import("sharp")).default;
  let out: Buffer;
  try {
    const img = sharp(input, { limitInputPixels: 50_000_000 }).rotate();
    out =
      kind === "players"
        ? await img.resize(512, 512, { fit: "cover", position: "attention" }).png({ compressionLevel: 9 }).toBuffer()
        : await img
            .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: true })
            .png({ compressionLevel: 9 })
            .toBuffer();
  } catch {
    throw new Error("Could not read that image file");
  }

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "img";
  const hash = createHash("sha256").update(out).digest("hex").slice(0, 12);
  const name = `${safeSlug}-${hash}.png`;
  const dir = join(/* turbopackIgnore: true */ UPLOADS_DIR, kind);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), out, { mode: 0o644 });
  return `/media/${kind}/${name}`;
}

/** Resolve a /media/... path to a file on disk, or null if the path is not a valid upload path. */
export function uploadFilePath(publicPath: string): string | null {
  const m = /^\/media\/(players|teams)\/([^/]+)$/.exec(publicPath);
  if (!m || !FILE_RE.test(m[2])) return null;
  return join(/* turbopackIgnore: true */ UPLOADS_DIR, m[1], m[2]);
}

export function isValidUploadName(kind: string, file: string): kind is UploadKind {
  return (UPLOAD_KINDS as readonly string[]).includes(kind) && FILE_RE.test(file);
}

export async function readUpload(publicPath: string): Promise<Buffer | null> {
  const p = uploadFilePath(publicPath);
  if (!p) return null;
  try {
    return await readFile(/* turbopackIgnore: true */ p);
  } catch {
    return null;
  }
}

/** Best-effort delete of a previous upload (ignores official /players or /teams files). */
export async function deleteUpload(publicPath: unknown): Promise<void> {
  if (typeof publicPath !== "string") return;
  const p = uploadFilePath(publicPath);
  if (!p) return;
  await unlink(/* turbopackIgnore: true */ p).catch(() => {});
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { UPLOADS_DIR, isValidUploadName } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; file: string }> }) {
  const { kind, file } = await params;
  if (!isValidUploadName(kind, file)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(join(/* turbopackIgnore: true */ UPLOADS_DIR, kind, file));
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(body.length),
        // filenames are content-hashed, so they never change
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
}

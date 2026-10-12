import Image from "next/image";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { removeImageAction, uploadImageAction } from "@/app/admin/actions";
import { btnCls, btnDangerCls, btnGhostCls } from "@/components/admin/ui";
import { isCustomUpload, officialImagesEnabled } from "@/lib/images";

export function ImageUpload({
  kind,
  id,
  slug,
  path,
  label,
}: {
  kind: "players" | "teams";
  id: number;
  slug: string;
  path: string | null;
  label: string;
}) {
  const custom = isCustomUpload(path);
  const officialPath = `/${kind}/${slug}.png`;
  const hasOfficial = existsSync(join(process.cwd(), "public", officialPath));
  const official = !custom && !!path;
  const shownPublicly = custom || (official && officialImagesEnabled());
  const status = custom
    ? "Custom upload — always shown on the site."
    : official
      ? officialImagesEnabled()
        ? "Official image — hidden if NEXT_PUBLIC_USE_OFFICIAL_IMAGES=false."
        : "Official image — currently hidden (kill switch off); fallback shown."
      : kind === "players"
        ? "No image — initials avatar shown."
        : "No logo — team badge shown.";
  const noun = kind === "players" ? "photo" : "logo";

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div
          className={`flex h-32 w-32 items-center justify-center overflow-hidden border border-border bg-bg ${
            kind === "players" ? "rounded-full" : "rounded-xl"
          }`}
        >
          {path ? (
            <Image
              src={path}
              alt={`Current ${noun} for ${label}`}
              width={128}
              height={128}
              unoptimized
              className={kind === "players" ? "h-full w-full object-cover" : "h-full w-full object-contain p-2"}
            />
          ) : (
            <span className="text-xs text-muted">None</span>
          )}
        </div>
        {path && !shownPublicly && <span className="text-xs text-amber">Not shown publicly</span>}
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <p className="text-sm text-muted">{status}</p>
        <form action={uploadImageAction} className="space-y-3">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <label htmlFor={`image-${kind}-${id}`} className="block text-sm font-medium">
            {path ? `Replace ${noun}` : `Upload ${noun}`}
          </label>
          <input
            id={`image-${kind}-${id}`}
            name="image"
            type="file"
            required
            accept="image/png,image/jpeg,image/webp"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-border file:px-3 file:py-2 file:text-text hover:file:bg-border/70"
          />
          <p className="text-xs text-muted">
            PNG, JPG or WebP, up to 5 MB. Saved as a {kind === "players" ? "512×512 square (center-cropped)" : "512px PNG with transparency"}.
          </p>
          <button className={btnCls}>Upload</button>
        </form>
        {(path || hasOfficial) && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {path && (
              <form action={removeImageAction}>
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="mode" value="none" />
                <button className={btnDangerCls}>
                  {kind === "players" ? "Remove (revert to initials)" : "Remove (revert to badge)"}
                </button>
              </form>
            )}
            {hasOfficial && path !== officialPath && (
              <form action={removeImageAction}>
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="mode" value="official" />
                <button className={btnGhostCls}>Use official image</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

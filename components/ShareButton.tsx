"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = { url: string; title: string; text?: string; className?: string; compact?: boolean };

const ic = "h-4 w-4 shrink-0";
const Icons = {
  share: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v14" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className={ic} fill="currentColor" aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className={ic} fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className={ic} fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  reddit: (
    <svg viewBox="0 0 24 24" className={ic} fill="currentColor" aria-hidden="true">
      <path d="M24 11.78a2.6 2.6 0 0 0-4.42-1.86 12.8 12.8 0 0 0-6.92-2.19l1.18-5.53 3.84.82a1.85 1.85 0 1 0 .19-.9l-4.29-.91a.46.46 0 0 0-.55.35l-1.31 6.17a12.84 12.84 0 0 0-7.02 2.19 2.6 2.6 0 1 0-2.86 4.25 5.1 5.1 0 0 0-.06.78c0 3.98 4.63 7.2 10.34 7.2s10.34-3.22 10.34-7.2c0-.26-.02-.52-.06-.77A2.6 2.6 0 0 0 24 11.78zM6.3 13.63a1.85 1.85 0 1 1 3.7 0 1.85 1.85 0 0 1-3.7 0zm10.3 4.88c-1.26 1.26-3.67 1.36-4.6 1.36s-3.34-.1-4.6-1.36a.5.5 0 0 1 .71-.71c.8.8 2.5 1.08 3.89 1.08s3.09-.28 3.89-1.08a.5.5 0 0 1 .71.71zm-.33-3.03a1.85 1.85 0 1 1 0-3.7 1.85 1.85 0 0 1 0 3.7z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" className={ic} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" />
    </svg>
  ),
};

export default function ShareButton({ url, title, text, className = "", compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const shareText = text ?? title;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    wrap.current?.querySelector<HTMLElement>("[data-share-item]")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function onClick() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: shareText, url });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
        // fall through to popover on other errors
      }
    }
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
  }

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(shareText);
  const links = [
    { name: "X (Twitter)", icon: Icons.x, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "Facebook", icon: Icons.facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "LinkedIn", icon: Icons.linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "Reddit", icon: Icons.reddit, href: `https://www.reddit.com/submit?url=${u}&title=${encodeURIComponent(title)}` },
  ];
  const item =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-border/60 focus:bg-border/60 focus:outline-none";

  return (
    <div ref={wrap} className={`relative inline-block ${className}`}>
      <button
        ref={btn}
        type="button"
        onClick={onClick}
        aria-label="Share this page"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`inline-flex items-center gap-2 rounded-full ${compact ? "max-sm:p-2" : ""} border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-teal hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal`}
      >
        {Icons.share}
        <span className={compact ? "max-sm:sr-only" : undefined}>Share</span>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Share options"
          className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-xl shadow-black/40"
        >
          <button type="button" role="menuitem" data-share-item onClick={copy} className={item}>
            <span className={copied ? "text-teal" : "text-muted"}>{copied ? Icons.check : Icons.link}</span>
            <span aria-live="polite">{copied ? "Copied!" : "Copy link"}</span>
          </button>
          <div className="my-1 h-px bg-border" role="separator" />
          {links.map((l) => (
            <a
              key={l.name}
              role="menuitem"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={item}
              onClick={() => setOpen(false)}
              aria-label={`Share on ${l.name}`}
            >
              <span className="text-muted">{l.icon}</span>
              {l.name}
            </a>
          ))}
          <a
            role="menuitem"
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`}
            className={item}
            onClick={() => setOpen(false)}
            aria-label="Share by email"
          >
            <span className="text-muted">{Icons.mail}</span>
            Email
          </a>
        </div>
      )}
    </div>
  );
}

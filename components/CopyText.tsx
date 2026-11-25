"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/** Read-only text with a copy button (citations, embed snippets). */
export default function CopyText({ text, label, event, multiline = false }: { text: string; label: string; event: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      track(event, {});
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="mt-2.5">
      <pre
        className={`max-w-full overflow-x-auto rounded-lg border border-border bg-bg/70 p-3 text-xs leading-relaxed text-text/90 ${multiline ? "whitespace-pre" : "whitespace-pre-wrap break-words"}`}
        aria-label={label}
      >
        <code>{text}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-text/90 transition hover:border-teal/50 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        {copied ? "Copied" : label}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
    </div>
  );
}

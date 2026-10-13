"use client";

// Replaces the root layout entirely, so styling is inline (no globals.css / Tailwind guaranteed).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const btn = {
    padding: "10px 20px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 16,
    textDecoration: "none",
    cursor: "pointer",
  } as const;
  return (
    <html lang="en">
      <head>
        <title>Injury timeout | Rupture Report</title>
        <meta name="robots" content="noindex" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0B0F14",
          color: "#E6EDF3",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
        }}
      >
        <main>
          <p style={{ margin: 0, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#14B8A6", fontWeight: 700 }}>
            Rupture Report
          </p>
          <h1 style={{ fontSize: 40, margin: "16px 0 8px" }}>Injury timeout</h1>
          <p style={{ color: "#8B98A5", fontSize: 18, margin: 0 }}>
            The whole site pulled up lame. The trainers are taking a look.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => reset()} style={{ ...btn, background: "#14B8A6", color: "#0B0F14", border: "none" }}>
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ ...btn, background: "#121821", color: "#E6EDF3", border: "1px solid #1F2933" }}>
              Home
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: 40, fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#8B98A5" }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}

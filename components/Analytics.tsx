import Script from "next/script";

/** GA4 measurement ID; override with NEXT_PUBLIC_GA_ID, set to "off" to disable. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-CSLTTBPH37";

/**
 * GA4 tag for public pages only (rendered from the (site) layout, so /admin is never tracked).
 * Client-side route changes are counted by GA4 enhanced measurement
 * ("Page changes based on browser history events", on by default).
 */
export default function Analytics() {
  if (!GA_ID || GA_ID === "off") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}

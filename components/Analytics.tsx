import Script from "next/script";
import AnalyticsEvents from "@/components/AnalyticsEvents";
import { GA_HOSTS, GA_INTERNAL_KEY } from "@/lib/analytics";

/** GA4 measurement ID; override with NEXT_PUBLIC_GA_ID, set to "off" to disable. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-CSLTTBPH37";

/**
 * GA4 tag for public pages only (rendered from the (site) layout, so /admin is never tracked).
 * Client-side route changes are counted by GA4 enhanced measurement
 * ("Page changes based on browser history events", on by default).
 *
 * The loader only runs on the production hostname, and never in a browser flagged internal:
 * visiting any page with ?ga_internal=1 (or opening /admin while logged in) sets the flag;
 * ?ga_internal=0 clears it. Without the tag, window.gtag is undefined and lib/analytics no-ops.
 */
export default function Analytics() {
  if (!GA_ID || GA_ID === "off") return null;
  const loader = `(function(){try{
var hosts=${JSON.stringify(GA_HOSTS)},key=${JSON.stringify(GA_INTERNAL_KEY)};
var q=new URLSearchParams(location.search).get('ga_internal');
if(q==='1'){localStorage.setItem(key,'1');}else if(q==='0'){localStorage.removeItem(key);}
if(hosts.indexOf(location.hostname)<0||localStorage.getItem(key)==='1')return;
window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};
gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)});
var pq=window.__rrq||[];window.__rrq=[];for(var i=0;i<pq.length;i++)gtag('event',pq[i][0],pq[i][1]);
var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+${JSON.stringify(GA_ID)};
document.head.appendChild(s);
}catch(e){}})();`;
  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {loader}
      </Script>
      <AnalyticsEvents />
    </>
  );
}

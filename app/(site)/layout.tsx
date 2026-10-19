import Analytics from "@/components/Analytics";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-texture min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
      <Analytics />
    </div>
  );
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rupture Report — NFL ACL & Achilles Tear Tracker",
    short_name: "Rupture Report",
    description: "Tracking every NFL ACL and Achilles tear, season by season.",
    start_url: "/",
    display: "standalone",
    theme_color: "#0B0F14",
    background_color: "#0B0F14",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

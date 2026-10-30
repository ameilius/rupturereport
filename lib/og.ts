export const defaultOgImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Rupture Report — NFL ACL & Achilles Tear Tracker",
};

/** NBA hub/list pages share one dynamic card (app/(site)/nba/opengraph-image.tsx → /nba/opengraph-image). */
export const nbaOgImage = {
  url: "/nba/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Rupture Report — NBA ACL & Achilles Tear Tracker",
};

/** Stats pages: one stable card per league (route handlers under /stats and /nba/stats). */
export const statsOgImage = (league: "NFL" | "NBA") => ({
  url: league === "NBA" ? "/nba/stats/opengraph-image" : "/stats/opengraph-image",
  width: 1200,
  height: 630,
  alt: `Rupture Report — ${league} ACL & Achilles Tear Stats`,
});

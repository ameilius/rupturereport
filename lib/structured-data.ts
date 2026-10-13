/** Shared, league-agnostic JSON-LD helpers. */
export const SITE_URL = "https://rupturereport.com";
export const SITE_NAME = "Rupture Report";
export const DATA_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
export const TERMS_URL = `${SITE_URL}/terms`;

export const organizationRef = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/logo-square-1024.png`, width: 1024, height: 1024 },
};

/** BreadcrumbList JSON-LD from [name, absolute-or-relative path] pairs. */
export function breadcrumbJsonLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: path.startsWith("http") ? path : `${SITE_URL}${path}`,
    })),
  };
}

export const dataCatalog = {
  "@type": "DataCatalog",
  name: SITE_NAME,
  url: SITE_URL,
};

export function datasetJsonLd(opts: {
  id: string;
  name: string;
  description: string;
  url: string;
  league: string; // e.g. "NFL"
  season: string; // e.g. "2026"
  keywords: string[];
  spatialCoverage?: string;
  dateModified?: string;
}) {
  return {
    "@type": "Dataset",
    "@id": opts.id,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    sameAs: opts.url,
    creator: organizationRef,
    publisher: organizationRef,
    license: DATA_LICENSE_URL,
    usageInfo: TERMS_URL,
    isAccessibleForFree: true,
    inLanguage: "en-US",
    temporalCoverage: opts.season,
    spatialCoverage: { "@type": "Place", name: opts.spatialCoverage ?? "United States" },
    keywords: opts.keywords,
    about: { "@type": "SportsOrganization", name: opts.league },
    variableMeasured: [
      "injury type",
      "injury date",
      "team",
      "position",
      "game context",
      "playing surface",
      "injury mechanism",
      "recovery stage",
    ],
    includedInDataCatalog: dataCatalog,
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

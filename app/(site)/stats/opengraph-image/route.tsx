import { statsOgResponse } from "@/lib/stats-og";

// Stable URL (route handler, not the file convention), like /nba/opengraph-image.
export async function GET() {
  return statsOgResponse("NFL");
}

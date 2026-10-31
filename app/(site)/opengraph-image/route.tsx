import { leagueOgResponse } from "@/lib/league-og";

// NFL league card at a stable URL (/opengraph-image); metadata appends ?v=<hash of the live counts>.
export async function GET() {
  return leagueOgResponse("NFL", "hub");
}

import { leagueOgResponse } from "@/lib/league-og";

// NBA league card at a stable URL (/nba/opengraph-image); metadata appends ?v=<hash of the live counts>.
export async function GET() {
  return leagueOgResponse("NBA", "hub");
}

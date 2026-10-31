import { leagueOgResponse } from "@/lib/league-og";

// Stable URL (route handler); metadata appends ?v=<hash of the live counts>.
export async function GET() {
  return leagueOgResponse("NBA", "stats");
}

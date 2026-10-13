import { connection } from "next/server";
import { llmsResponse } from "@/lib/llms";

export async function GET() {
  await connection();
  return llmsResponse(true);
}

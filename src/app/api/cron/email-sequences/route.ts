import { NextRequest, NextResponse } from "next/server";
import { processSequences } from "@/lib/email-sequences";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const result = await processSequences();
  return NextResponse.json(result);
}

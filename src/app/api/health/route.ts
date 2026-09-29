import { isDryRun } from "@/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", dryRun: isDryRun() });
}

import { createReceptionLogger } from "@/server/logger";
import { listDestinationResponse } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  try {
    return Response.json({ destinations: listDestinationResponse() });
  } catch {
    createReceptionLogger().write({
      at: new Date().toISOString(),
      type: null,
      destinationId: null,
      ok: false,
    });
    return Response.json({ ok: false, error: "destinations_unavailable" }, { status: 500 });
  }
}

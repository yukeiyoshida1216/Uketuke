import { createReceptionLogger } from "@/server/logger";
import { submitReception } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    createReceptionLogger().write({
      at: new Date().toISOString(),
      type: null,
      destinationId: null,
      ok: false,
    });
    return Response.json({ ok: false, error: "validation_error", fields: ["body"] }, { status: 400 });
  }
  const result = await submitReception(body);
  return Response.json(result.body, { status: result.status });
}

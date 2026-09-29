import { limits } from "@/config/reception";

export type ReceptionType = "general" | "interview" | "other";

export type GeneralPayload = {
  type: "general";
  companyName: string;
  visitorName: string;
  visitorCount: number;
  destinationId: string;
};

export type InterviewPayload = {
  type: "interview";
  visitorName: string;
};

export type OtherPayload = {
  type: "other";
};

export type ReceptionPayload = GeneralPayload | InterviewPayload | OtherPayload;

export type FieldName =
  | "body"
  | "type"
  | "idempotencyKey"
  | "companyName"
  | "visitorName"
  | "visitorCount"
  | "destinationId";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

export function parseVisitorCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < limits.minVisitorCount || value > limits.maxVisitorCount) return null;
  return value;
}

export function normalizeCountInput(raw: string): string {
  const digits = raw
    .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, "");
  return digits.slice(0, String(limits.maxVisitorCount).length);
}

export function digitsToCount(digits: string): number | null {
  if (!/^[0-9]+$/.test(digits)) return null;
  return parseVisitorCount(Number(digits));
}

export function receptionFingerprint(payload: ReceptionPayload): string {
  switch (payload.type) {
    case "general":
      return JSON.stringify([
        "general",
        payload.companyName,
        payload.visitorName,
        payload.visitorCount,
        payload.destinationId,
      ]);
    case "interview":
      return JSON.stringify(["interview", payload.visitorName]);
    case "other":
      return JSON.stringify(["other"]);
  }
}

export function logContextFromBody(body: unknown): {
  type: ReceptionType | null;
  destinationId: string | null;
} {
  if (!isRecord(body)) return { type: null, destinationId: null };
  const type =
    body.type === "general" || body.type === "interview" || body.type === "other"
      ? body.type
      : null;
  const destinationId =
    type === "general" && typeof body.destinationId === "string" && body.destinationId.trim()
      ? body.destinationId.trim()
      : null;
  return { type, destinationId };
}

export type ParsedReception =
  | { ok: true; idempotencyKey: string; payload: ReceptionPayload }
  | { ok: false; fields: FieldName[] };

function parseIdempotencyKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const key = value.trim();
  if (key.length < 8 || key.length > limits.maxIdempotencyKeyLength) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(key)) return null;
  return key;
}

export function parseReceptionBody(body: unknown): ParsedReception {
  if (!isRecord(body)) return { ok: false, fields: ["body"] };

  const fields: FieldName[] = [];
  const idempotencyKey = parseIdempotencyKey(body.idempotencyKey);
  if (!idempotencyKey) fields.push("idempotencyKey");

  if (body.type !== "general" && body.type !== "interview" && body.type !== "other") {
    fields.push("type");
    return { ok: false, fields };
  }

  if (body.type === "general") {
    const companyName = normalizeText(body.companyName, limits.maxCompanyLength);
    const visitorName = normalizeText(body.visitorName, limits.maxNameLength);
    const visitorCount = parseVisitorCount(body.visitorCount);
    const destinationId = normalizeText(body.destinationId, 40);
    if (!companyName) fields.push("companyName");
    if (!visitorName) fields.push("visitorName");
    if (visitorCount === null) fields.push("visitorCount");
    if (!destinationId) fields.push("destinationId");
    if (!idempotencyKey || !companyName || !visitorName || visitorCount === null || !destinationId) {
      return { ok: false, fields };
    }
    return {
      ok: true,
      idempotencyKey,
      payload: { type: "general", companyName, visitorName, visitorCount, destinationId },
    };
  }

  if (body.type === "interview") {
    const visitorName = normalizeText(body.visitorName, limits.maxNameLength);
    if (!visitorName) fields.push("visitorName");
    if (!idempotencyKey || !visitorName) return { ok: false, fields };
    return { ok: true, idempotencyKey, payload: { type: "interview", visitorName } };
  }

  if (!idempotencyKey) return { ok: false, fields };
  return { ok: true, idempotencyKey, payload: { type: "other" } };
}

export function validatedGeneralDraft(draft: {
  companyName: string;
  visitorName: string;
  visitorCount: string;
}):
  | { ok: true; companyName: string; visitorName: string; visitorCount: number }
  | { ok: false; fields: FieldName[] } {
  const fields: FieldName[] = [];
  const companyName = normalizeText(draft.companyName, limits.maxCompanyLength);
  const visitorName = normalizeText(draft.visitorName, limits.maxNameLength);
  const visitorCount = digitsToCount(draft.visitorCount);
  if (!companyName) fields.push("companyName");
  if (!visitorName) fields.push("visitorName");
  if (visitorCount === null) fields.push("visitorCount");
  if (!companyName || !visitorName || visitorCount === null) return { ok: false, fields };
  return { ok: true, companyName, visitorName, visitorCount };
}

export function validatedInterviewName(value: string): string | null {
  return normalizeText(value, limits.maxNameLength);
}

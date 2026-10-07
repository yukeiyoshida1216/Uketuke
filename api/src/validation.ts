import { z } from "zod";
import type { NotifyRequest } from "./types.js";

const trimmedNonEmpty = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1, "required"));

const idempotencyKey = z
  .string()
  .trim()
  .min(8, "idempotencyKey must be at least 8 characters")
  .max(128, "idempotencyKey must be at most 128 characters");

const generalSchema = z.object({
  type: z.literal("general"),
  companyName: trimmedNonEmpty,
  visitorName: trimmedNonEmpty,
  partySize: z
    .number({ invalid_type_error: "partySize must be a number" })
    .int("partySize must be an integer")
    .min(1, "partySize must be between 1 and 99")
    .max(99, "partySize must be between 1 and 99"),
  destinationId: trimmedNonEmpty,
  idempotencyKey
});

const interviewSchema = z.object({
  type: z.literal("interview"),
  purpose: z.enum(["interview", "training"], {
    errorMap: () => ({ message: "purpose must be interview or training" })
  }),
  visitorName: trimmedNonEmpty,
  idempotencyKey
});

const deliverySchema = z.object({
  type: z.literal("delivery"),
  idempotencyKey
});

const otherSchema = z.object({
  type: z.literal("other"),
  idempotencyKey
});

const notifySchema = z.discriminatedUnion("type", [
  generalSchema,
  interviewSchema,
  deliverySchema,
  otherSchema
]);

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function parseNotifyRequest(body: unknown): NotifyRequest {
  const result = notifySchema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new HttpError(400, "VALIDATION_ERROR", first?.message ?? "invalid request");
  }
  return result.data;
}

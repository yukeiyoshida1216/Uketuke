import "server-only";

import { timings } from "@/config/reception";
import { toPublicDestinations, loadStaff } from "@/server/destinations";
import { defaultDestinationsFile, readIntegrationConfig } from "@/server/env";
import { createReceptionLogger } from "@/server/logger";
import { createReceptionService } from "@/server/reception-service";
import { createSlackPoster } from "@/server/slack-client";
import { SubmissionGuard, type SubmitResult } from "@/server/submission-guard";

let guard: SubmissionGuard | undefined;

function sharedGuard(): SubmissionGuard {
  guard ??= new SubmissionGuard({
    dedupWindowMs: timings.dedupWindowMs,
    idempotencyTtlMs: timings.idempotencyTtlMs,
  });
  return guard;
}

export function listDestinationResponse(): Array<{ id: string; name: string }> {
  const file = process.env.DESTINATIONS_FILE?.trim() || defaultDestinationsFile();
  return toPublicDestinations(loadStaff(file, {}));
}

export async function submitReception(body: unknown): Promise<SubmitResult> {
  const logger = createReceptionLogger();
  try {
    const config = readIntegrationConfig();
    const staff = loadStaff(config.destinationsFile, config.slackUserIds);
    const service = createReceptionService({
      staff,
      interviewMentionIds: config.interviewMentionIds,
      deliveryMentionIds: config.deliveryMentionIds,
      dryRun: config.dryRun,
      postSlack: createSlackPoster({
        dryRun: config.dryRun,
        token: config.slackBotToken,
        channel: config.slackChannelId,
      }),
      log: logger.write,
      now: () => Date.now(),
      guard: sharedGuard(),
    });
    return await service.submit(body);
  } catch {
    logger.write({
      at: new Date().toISOString(),
      type: null,
      destinationId: null,
      ok: false,
    });
    return { status: 500, body: { ok: false, error: "notify_failed" } };
  }
}

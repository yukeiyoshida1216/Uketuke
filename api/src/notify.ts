import { findDestination, loadDestinations } from "./destinations.js";
import { DuplicateWindow } from "./duplicate.js";
import { IdempotencyStore } from "./idempotency.js";
import { HttpError } from "./validation.js";
import { buildSlackMessage } from "./slack.js";
import type { AppConfig, NotifyRequest, SlackClient } from "./types.js";

export type NotifyResult = {
  dryRun: boolean;
  destinationId: string | null;
};

export function createNotifyService(input: {
  config: AppConfig;
  slack: SlackClient;
  duplicates: DuplicateWindow;
  idempotency: IdempotencyStore;
  readDestinations?: () => ReturnType<typeof loadDestinations>;
}) {
  const readDestinations = input.readDestinations ?? (() => loadDestinations(input.config.destinationsPath));

  return {
    async notify(request: NotifyRequest): Promise<NotifyResult> {
      return input.idempotency.run(request.idempotencyKey, async () => {
        if (input.duplicates.isDuplicate(request)) {
          throw new HttpError(409, "DUPLICATE", "same request was already accepted recently");
        }

        const destinations = readDestinations();
        const destination =
          request.type === "general" ? findDestination(destinations, request.destinationId) : undefined;

        if (request.type === "general" && !destination) {
          throw new HttpError(400, "UNKNOWN_DESTINATION", "destinationId is not registered");
        }

        const message = buildSlackMessage({
          request,
          destination,
          interviewMentionUserIds: input.config.interviewMentionUserIds,
          deliveryMentionUserIds: input.config.deliveryMentionUserIds
        });

        if (!input.config.dryRun) {
          await input.slack.send(message.text);
        }

        input.duplicates.rememberSuccess(request);

        return {
          dryRun: input.config.dryRun,
          destinationId: request.type === "general" ? request.destinationId : null
        };
      });
    }
  };
}

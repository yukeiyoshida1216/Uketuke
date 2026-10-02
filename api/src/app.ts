import express, { type ErrorRequestHandler, type Express } from "express";
import { loadDestinations, toPublicDestinations } from "./destinations.js";
import { DuplicateWindow } from "./duplicate.js";
import { toReceptionLog, writeReceptionLog } from "./logger.js";
import { createNotifyService } from "./notify.js";
import { createWebhookSlackClient } from "./slack.js";
import type { AppConfig, SlackClient } from "./types.js";
import { HttpError, parseNotifyRequest } from "./validation.js";

export function createApp(input: {
  config: AppConfig;
  slack?: SlackClient;
  clock?: () => number;
}): Express {
  const slack = input.slack ?? createWebhookSlackClient(input.config.slackWebhookUrl);
  const duplicates = new DuplicateWindow(input.config.duplicateWindowMs, input.clock);
  const notifyService = createNotifyService({ config: input.config, slack, duplicates });
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/destinations", (_req, res, next) => {
    try {
      const destinations = toPublicDestinations(loadDestinations(input.config.destinationsPath));
      res.json({ destinations });
    } catch (error) {
      next(error);
    }
  });

  app.post("/notify", async (req, res, next) => {
    let receptionType = "unknown";
    let destinationId: string | null = null;
    try {
      const request = parseNotifyRequest(req.body);
      receptionType = request.type;
      destinationId = request.type === "general" ? request.destinationId : null;
      const result = await notifyService.notify(request);
      writeReceptionLog(
        toReceptionLog({
          type: receptionType,
          destinationId,
          ok: true
        })
      );
      res.json({ ok: true, dryRun: result.dryRun });
    } catch (error) {
      writeReceptionLog(
        toReceptionLog({
          type: receptionType,
          destinationId,
          ok: false
        })
      );
      next(error);
    }
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.code, message: error.message });
      return;
    }
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: "INVALID_JSON", message: "invalid JSON" });
      return;
    }
    res.status(500).json({ error: "INTERNAL_ERROR", message: "internal error" });
  };

  app.use(errorHandler);
  return app;
}

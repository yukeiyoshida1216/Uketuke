import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { loadDestinations } from "./destinations.js";

function applyDotEnv(): void {
  const filePath = resolve(process.cwd(), ".env");
  if (!existsSync(filePath)) {
    return;
  }
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

applyDotEnv();
const config = loadConfig();
loadDestinations(config.destinationsPath);

const app = createApp({ config });
const server = app.listen(config.port, () => {
  process.stdout.write(
    JSON.stringify({
      ts: new Date().toISOString(),
      event: "listen",
      port: config.port,
      dryRun: config.dryRun
    }) + "\n"
  );
});

function shutdown(): void {
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

import { readFileSync } from "node:fs";
import { z } from "zod";
import type { Destination, PublicDestination } from "./types.js";

const destinationSchema = z.object({
  id: z.string().trim().min(1),
  displayName: z.string().trim().min(1),
  slackUserId: z.string().trim().min(1)
});

const destinationsFileSchema = z.array(destinationSchema).min(1);

export function loadDestinations(filePath: string): Destination[] {
  const raw = readFileSync(filePath, "utf8");
  const parsed = destinationsFileSchema.parse(JSON.parse(raw));
  const ids = new Set<string>();
  for (const item of parsed) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate destination id: ${item.id}`);
    }
    ids.add(item.id);
  }
  return parsed;
}

export function toPublicDestinations(destinations: Destination[]): PublicDestination[] {
  return destinations.map(({ id, displayName }) => ({ id, displayName }));
}

export function findDestination(
  destinations: Destination[],
  destinationId: string
): Destination | undefined {
  return destinations.find((item) => item.id === destinationId);
}

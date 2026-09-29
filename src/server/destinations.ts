import fs from "node:fs";

const DESTINATION_ID = /^[a-z0-9_-]{1,40}$/;

export type StaffRecord = {
  id: string;
  name: string;
  slackUserId: string | null;
};

export function loadStaff(filePath: string, slackUserIds: Record<string, string>): StaffRecord[] {
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("destinations_file_invalid");
  const seen = new Set<string>();
  return parsed.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("destinations_file_invalid");
    }
    const record = item as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (!DESTINATION_ID.test(id) || name.length === 0 || name.length > 80) {
      throw new Error("destinations_file_invalid");
    }
    if (seen.has(id)) throw new Error("destinations_file_invalid");
    seen.add(id);
    const slackUserId = slackUserIds[id]?.trim() || null;
    return { id, name, slackUserId };
  });
}

export function toPublicDestinations(staff: StaffRecord[]): Array<{ id: string; name: string }> {
  return staff.map((person) => ({ id: person.id, name: person.name }));
}

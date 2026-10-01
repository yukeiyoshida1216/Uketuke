import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadStaff, toPublicDestinations } from "@/server/destinations";
import { describe, expect, it } from "vitest";

describe("訪問先一覧", () => {
  it("ファイルに Slack User ID があっても公開レスポンスへは出さない", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "destinations-"));
    const file = path.join(dir, "destinations.json");
    await writeFile(
      file,
      JSON.stringify([
        { id: "nosaka", name: "野坂 星司", slackUserId: "UNOSAKA" },
        { id: "yanase", name: "梁瀬 聖太", slackUserId: "UYANASE" },
      ]),
    );
    const staff = loadStaff(file, { nosaka: "UNOSAKA", yanase: "UYANASE" });
    const published = toPublicDestinations(staff);
    const encoded = JSON.stringify(published);
    expect(published).toEqual([
      { id: "nosaka", name: "野坂 星司" },
      { id: "yanase", name: "梁瀬 聖太" },
    ]);
    expect(encoded).not.toContain("slackUserId");
    expect(encoded).not.toContain("UNOSAKA");
    expect(encoded).not.toContain("UYANASE");
    expect(Object.keys(published[0]).sort()).toEqual(["id", "name"]);
  });
});

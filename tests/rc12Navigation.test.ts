import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("RC12 completed-campaign enigma navigation", () => {
  const app = readFileSync(resolve(process.cwd(), "src/App.tsx"), "utf8");
  it("does not auto-open the reward overlay from selecting box-12", () => {
    expect(app).toContain("progress.campaignCompleted && showCompletion");
    expect(app).not.toContain("selected?.id === \"box-12\"");
  });
  it("renders a functional 12-box index", () => {
    expect(app).toContain("enigmas.map((enigma) =>");
    expect(app).toContain("onAction={handleEnigma}");
  });
});
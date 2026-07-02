import { describe, expect, it } from "vitest";

import { mermaidTemplates } from "./templates";

describe("mermaidTemplates", () => {
  it("contains common Mermaid examples with unique ids", () => {
    const ids = new Set(mermaidTemplates.map((template) => template.id));

    expect(ids.size).toBe(mermaidTemplates.length);
    expect(mermaidTemplates.length).toBeGreaterThanOrEqual(4);
    expect(mermaidTemplates.every((template) => template.label && template.code.includes("\n"))).toBe(true);
  });

  it("includes a flowchart template", () => {
    expect(mermaidTemplates.some((template) => template.id === "flowchart")).toBe(true);
  });
});

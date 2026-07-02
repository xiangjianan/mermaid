import { describe, expect, it } from "vitest";

import { normalizeMermaidSource } from "./source";

describe("normalizeMermaidSource", () => {
  it("returns empty for blank input", () => {
    expect(normalizeMermaidSource("  \n\t")).toEqual({ found: false, code: "" });
  });

  it("returns raw Mermaid code when no fenced block exists", () => {
    expect(normalizeMermaidSource("flowchart TD\n  A --> B")).toEqual({
      found: true,
      code: "flowchart TD\n  A --> B"
    });
  });

  it("extracts fenced Mermaid code for backward compatibility", () => {
    expect(normalizeMermaidSource("# Notes\n\n```mermaid\nflowchart LR\nA --> B\n```")).toEqual({
      found: true,
      code: "flowchart LR\nA --> B"
    });
  });
});

import { describe, expect, it } from "vitest";

import { enhanceMermaidSvg } from "./svgEnhancer";

describe("enhanceMermaidSvg", () => {
  it("adds visualizer metadata and preserves the mermaid svg class", () => {
    const enhanced = enhanceMermaidSvg(
      '<svg viewBox="0 0 10 10"><g class="node"><rect /></g></svg>'
    );

    const root = new DOMParser().parseFromString(enhanced, "image/svg+xml").querySelector("svg");

    expect(root?.getAttribute("class")).toBe("mermaid-svg visualizer-svg");
    expect(root?.getAttribute("data-enhanced")).toBe("true");
    expect(root?.getAttribute("role")).toBe("img");
  });

  it("keeps an existing mermaid svg class when adding the visualizer class", () => {
    const enhanced = enhanceMermaidSvg(
      '<svg class="mermaid-svg" viewBox="0 0 10 10"><g class="node"><rect /></g></svg>'
    );

    const root = new DOMParser().parseFromString(enhanced, "image/svg+xml").querySelector("svg");

    expect(root?.getAttribute("class")).toBe("mermaid-svg visualizer-svg");
    expect(root?.getAttribute("data-enhanced")).toBe("true");
  });

  it("normalizes path line caps and joins", () => {
    const enhanced = enhanceMermaidSvg(
      '<svg viewBox="0 0 10 10"><path class="flowchart-link" d="M0 0 L10 10" /></svg>'
    );

    const path = new DOMParser().parseFromString(enhanced, "image/svg+xml").querySelector("path");

    expect(path?.getAttribute("stroke-linecap")).toBe("round");
    expect(path?.getAttribute("stroke-linejoin")).toBe("round");
    expect(path?.getAttribute("stroke-width")).toBe("2.2");
  });

  it("returns original markup when parsing fails", () => {
    const invalidSvg = '<svg viewBox="0 0 10 10"><g></svg>';

    expect(enhanceMermaidSvg(invalidSvg)).toBe(invalidSvg);
  });
});

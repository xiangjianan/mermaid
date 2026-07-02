import { describe, expect, it } from "vitest";

import { clampZoom, renderModes, visualStyles } from "./viewOptions";

describe("viewOptions", () => {
  it("defines two render modes and four styles", () => {
    expect(renderModes.map((mode) => mode.id)).toEqual(["standard", "beautified"]);
    expect(visualStyles.map((style) => style.id)).toEqual([
      "product-saas",
      "classic",
      "soft-color",
      "dark"
    ]);
  });

  it("clamps zoom", () => {
    expect(clampZoom(20)).toBe(50);
    expect(clampZoom(110)).toBe(110);
    expect(clampZoom(240)).toBe(200);
  });

  it("falls back to default zoom for non-finite values", () => {
    expect(clampZoom(Number.NaN)).toBe(100);
    expect(clampZoom(Infinity)).toBe(100);
    expect(clampZoom(-Infinity)).toBe(100);
  });
});

import { describe, expect, it } from "vitest";

import { getSvgExportDimensions } from "./pngExport";

describe("getSvgExportDimensions", () => {
  it("uses explicit width and height", () => {
    expect(getSvgExportDimensions('<svg width="320" height="180"></svg>')).toEqual({
      width: 320,
      height: 180
    });
  });

  it("falls back to viewBox dimensions", () => {
    expect(getSvgExportDimensions('<svg viewBox="0 0 640 360"></svg>')).toEqual({
      width: 640,
      height: 360
    });
  });

  it("returns null when no dimensions are available", () => {
    expect(getSvgExportDimensions("<svg></svg>")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { exportSvgToPng, getSvgExportDimensions } from "./pngExport";

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

  it("falls back to viewBox dimensions when explicit dimensions are percentages", () => {
    expect(
      getSvgExportDimensions('<svg width="100%" height="100%" viewBox="0 0 640 360"></svg>')
    ).toEqual({
      width: 640,
      height: 360
    });
  });

  it("returns null when no dimensions are available", () => {
    expect(getSvgExportDimensions("<svg></svg>")).toBeNull();
  });
});

describe("exportSvgToPng", () => {
  it.each([0, Number.NaN, Infinity])("rejects invalid scale %s", async (scale) => {
    await expect(exportSvgToPng('<svg width="320" height="180"></svg>', { scale })).rejects.toThrow(
      "PNG export scale must be a finite number greater than 0."
    );
  });
});

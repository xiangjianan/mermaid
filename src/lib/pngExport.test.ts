import { afterEach, describe, expect, it, vi } from "vitest";

import { exportSvgToPng, getSvgExportDimensions } from "./pngExport";

const originalImage = globalThis.Image;

afterEach(() => {
  document.body.innerHTML = "";
  globalThis.Image = originalImage;
  vi.restoreAllMocks();
});

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

  it("inlines computed SVG styles before creating the image blob", async () => {
    document.body.innerHTML = `
      <div class="diagram-surface">
        <svg width="20" height="10" viewBox="0 0 20 10">
          <path d="M0 0L10 10" style="stroke: rgb(17, 24, 39); fill: none;" />
        </svg>
      </div>
    `;

    const blobInputs: string[] = [];
    const OriginalBlob = Blob;
    const blobSpy = vi.spyOn(globalThis, "Blob").mockImplementation(function BlobMock(
      parts,
      options
    ) {
      blobInputs.push(String(parts?.[0] ?? ""));
      return new OriginalBlob(parts, options);
    });

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function toBlob(callback) {
      callback(new OriginalBlob(["png"], { type: "image/png" }));
    });

    class FakeImage {
      decoding = "async";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }

    globalThis.Image = FakeImage as unknown as typeof Image;

    await exportSvgToPng('<svg width="20" height="10" viewBox="0 0 20 10"></svg>');

    expect(blobSpy).toHaveBeenCalled();
    expect(blobInputs[0]).toContain("stroke: rgb(17, 24, 39)");
  });
});

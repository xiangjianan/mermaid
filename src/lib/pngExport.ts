export type PngExportOptions = {
  filename?: string;
  scale?: number;
  background?: string;
};

export type SvgDimensions = {
  width: number;
  height: number;
};

function parseNumericDimension(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getSvgExportDimensions(svgMarkup: string): SvgDimensions | null {
  const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
  const svg = document.querySelector("svg");

  if (!svg || document.querySelector("parsererror")) {
    return null;
  }

  const width = parseNumericDimension(svg.getAttribute("width"));
  const height = parseNumericDimension(svg.getAttribute("height"));

  if (width && height) {
    return { width, height };
  }

  const viewBox = svg.getAttribute("viewBox")?.trim().split(/\s+/).map(Number);

  if (viewBox?.length === 4 && viewBox.every((value) => Number.isFinite(value))) {
    const [, , viewBoxWidth, viewBoxHeight] = viewBox;
    if (viewBoxWidth > 0 && viewBoxHeight > 0) {
      return { width: viewBoxWidth, height: viewBoxHeight };
    }
  }

  return null;
}

export async function exportSvgToPng(svgMarkup: string, options: PngExportOptions = {}) {
  const dimensions = getSvgExportDimensions(svgMarkup);

  if (!dimensions) {
    throw new Error("The rendered SVG has no usable dimensions for PNG export.");
  }

  const scale = options.scale ?? 2;
  const background = options.background ?? "#ffffff";
  const filename = options.filename ?? "mermaid-diagram.png";
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not load SVG for PNG export."));
    });
    image.src = svgUrl;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(dimensions.width * scale);
    canvas.height = Math.ceil(dimensions.height * scale);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is unavailable for PNG export.");
    }

    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create PNG export."));
        }
      }, "image/png");
    });

    const pngUrl = URL.createObjectURL(pngBlob);
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(pngUrl);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

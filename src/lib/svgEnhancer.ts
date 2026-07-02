import type { RenderMode, VisualStyle } from "./viewOptions";

export type SvgEnhanceOptions = {
  mode?: RenderMode;
  style?: VisualStyle;
};

export function enhanceMermaidSvg(svgMarkup: string, options: SvgEnhanceOptions = {}): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgMarkup, "image/svg+xml");
  const parseError = document.querySelector("parsererror");
  const svg = document.querySelector("svg");

  if (parseError || !svg) {
    return svgMarkup;
  }

  const mode = options.mode ?? "beautified";
  const style = options.style ?? "product-saas";

  svg.classList.add("mermaid-svg");
  svg.setAttribute("data-enhanced", "true");
  svg.setAttribute("role", "img");

  if (mode === "standard") {
    svg.classList.add("visualizer-mode-standard");
    return new XMLSerializer().serializeToString(svg);
  }

  svg.classList.add("visualizer-svg", "visualizer-mode-beautified", `visualizer-style-${style}`);

  const paths = svg.querySelectorAll("path");
  paths.forEach((path) => {
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
  });

  const edgePaths = svg.querySelectorAll(".flowchart-link, .edge-thickness-normal");
  edgePaths.forEach((edge) => {
    edge.setAttribute("stroke-width", "2.2");
  });

  return new XMLSerializer().serializeToString(svg);
}

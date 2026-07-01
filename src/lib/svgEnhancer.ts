export function enhanceMermaidSvg(svgMarkup: string): string {
  const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");

  if (document.querySelector("parsererror")) {
    return svgMarkup;
  }

  const svg = document.querySelector("svg");

  if (!svg) {
    return svgMarkup;
  }

  svg.classList.add("mermaid-svg", "visualizer-svg");
  svg.setAttribute("data-enhanced", "true");
  svg.setAttribute("role", "img");

  document.querySelectorAll("path").forEach((path) => {
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
  });

  document.querySelectorAll(".flowchart-link, .edge-thickness-normal").forEach((path) => {
    path.setAttribute("stroke-width", "2.2");
  });

  return new XMLSerializer().serializeToString(svg);
}

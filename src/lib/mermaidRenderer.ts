import mermaid from "mermaid";

import { enhanceMermaidSvg } from "./svgEnhancer";

export type MermaidRenderResult =
  | { status: "success"; svg: string }
  | { status: "error"; message: string };

let initialized = false;
let renderCounter = 0;

export function initializeMermaid(): void {
  if (initialized) {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    flowchart: {
      curve: "basis",
      htmlLabels: false,
      nodeSpacing: 56,
      rankSpacing: 72,
      padding: 18
    },
    theme: "base",
    themeVariables: {
      background: "#f6f8fb",
      primaryColor: "#ffffff",
      primaryBorderColor: "#d8e1ec",
      primaryTextColor: "#24364b",
      lineColor: "#607086",
      arrowheadColor: "#607086",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: "15px",
      edgeLabelBackground: "#f6f8fb",
      clusterBkg: "#ffffff",
      clusterBorder: "#d8e1ec"
    }
  });

  initialized = true;
}

export async function renderMermaidDiagram(source: string): Promise<MermaidRenderResult> {
  try {
    initializeMermaid();

    renderCounter += 1;
    const id = `mermaid-visualizer-${Date.now()}-${renderCounter}`;
    const { svg } = await mermaid.render(id, source);

    return {
      status: "success",
      svg: enhanceMermaidSvg(svg)
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

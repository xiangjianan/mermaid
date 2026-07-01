export type MermaidBlockResult =
  | { found: true; code: string }
  | { found: false; code: "" };

const mermaidFencePattern =
  /^[ \t]*```[ \t]*mermaid[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```/im;

export function extractFirstMermaidBlock(markdown: string): MermaidBlockResult {
  const match = mermaidFencePattern.exec(markdown);

  if (!match) {
    return { found: false, code: "" };
  }

  return { found: true, code: match[1].trim() };
}

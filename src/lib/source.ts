import { extractFirstMermaidBlock, type MermaidBlockResult } from "./markdown";

export function normalizeMermaidSource(input: string): MermaidBlockResult {
  if (input.trim().length === 0) {
    return { found: false, code: "" };
  }

  const fencedBlock = extractFirstMermaidBlock(input);

  if (fencedBlock.found) {
    return fencedBlock;
  }

  return { found: true, code: input.trim() };
}

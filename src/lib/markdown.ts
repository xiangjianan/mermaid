export type MermaidBlockResult =
  | { found: true; code: string }
  | { found: false; code: "" };

const openingFencePattern = /^ {0,3}(`{3,}|~{3,})[ \t]*(.*)$/;

function isMermaidInfo(info: string): boolean {
  return /^mermaid(?:\s|$)/i.test(info.trim());
}

function isClosingFence(line: string, marker: string): boolean {
  const fenceCharacter = marker[0];
  const minimumLength = marker.length;
  const closingFencePattern = new RegExp(
    `^ {0,3}\\${fenceCharacter}{${minimumLength},}[ \\t]*$`
  );

  return closingFencePattern.test(line);
}

export function extractFirstMermaidBlock(markdown: string): MermaidBlockResult {
  const lines = markdown.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const openingMatch = openingFencePattern.exec(lines[index]);

    if (!openingMatch || !isMermaidInfo(openingMatch[2])) {
      continue;
    }

    const marker = openingMatch[1];
    const codeLines: string[] = [];

    for (let codeIndex = index + 1; codeIndex < lines.length; codeIndex += 1) {
      if (isClosingFence(lines[codeIndex], marker)) {
        return { found: true, code: codeLines.join("\n").trim() };
      }

      codeLines.push(lines[codeIndex]);
    }
  }

  return { found: false, code: "" };
}

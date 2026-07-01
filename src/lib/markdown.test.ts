import { describe, expect, it } from "vitest";

import { extractFirstMermaidBlock } from "./markdown";

describe("extractFirstMermaidBlock", () => {
  it("extracts the first mermaid fenced block from Markdown", () => {
    const markdown = [
      "# Product Flow",
      "",
      "```mermaid",
      "flowchart LR",
      "  A[Paste Markdown] --> B{Find Mermaid}",
      "```",
      ""
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "flowchart LR\n  A[Paste Markdown] --> B{Find Mermaid}"
    });
  });

  it("matches Mermaid language case-insensitively", () => {
    const markdown = [
      "```Mermaid",
      "sequenceDiagram",
      "  Alice->>Bob: Hello",
      "```"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "sequenceDiagram\n  Alice->>Bob: Hello"
    });
  });

  it("returns an empty result when no mermaid fence exists", () => {
    const markdown = [
      "# Notes",
      "",
      "```ts",
      "const value = 1;",
      "```"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: false,
      code: ""
    });
  });

  it("extracts only the first mermaid block", () => {
    const markdown = [
      "```mermaid",
      "flowchart TD",
      "  A --> B",
      "```",
      "",
      "```mermaid",
      "flowchart LR",
      "  C --> D",
      "```"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "flowchart TD\n  A --> B"
    });
  });

  it("extracts mermaid fences with trailing info", () => {
    const markdown = [
      '```mermaid title="Flow"',
      "flowchart LR",
      "  A --> B",
      "```"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "flowchart LR\n  A --> B"
    });
  });

  it("extracts tilde mermaid fences", () => {
    const markdown = [
      "~~~mermaid",
      "flowchart LR",
      "  A --> B",
      "~~~"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "flowchart LR\n  A --> B"
    });
  });

  it("extracts mermaid blocks with longer fences", () => {
    const markdown = [
      "````mermaid",
      "flowchart LR",
      "  A[Contains ``` text] --> B",
      "````"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "flowchart LR\n  A[Contains ``` text] --> B"
    });
  });

  it("does not match four-space-indented mermaid fences", () => {
    const markdown = [
      "    ```mermaid",
      "    flowchart LR",
      "      A --> B",
      "    ```",
      "",
      "```mermaid",
      "flowchart TD",
      "  C --> D",
      "```"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "flowchart TD\n  C --> D"
    });
  });

  it("does not extract mermaid fences nested inside another fenced block", () => {
    const markdown = [
      "````md",
      "Example:",
      "```mermaid",
      "flowchart LR",
      "  A --> B",
      "```",
      "````",
      "",
      "```mermaid",
      "flowchart TD",
      "  C --> D",
      "```"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: true,
      code: "flowchart TD\n  C --> D"
    });
  });

  it("treats the rest of the document as non-mermaid code after an unclosed non-mermaid fence", () => {
    const markdown = [
      "```md",
      "Example:",
      "```mermaid",
      "flowchart LR",
      "  A --> B"
    ].join("\n");

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      found: false,
      code: ""
    });
  });
});

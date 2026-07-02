# ProcessOn-Like Mermaid Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing Mermaid visualizer into a ProcessOn-like pure frontend tool with direct Mermaid input, render modes, styles, templates, zoom, and full-diagram PNG export.

**Architecture:** Keep the existing Vite + React + TypeScript app. Add focused library modules for source normalization, templates, view options, SVG export, and zoom math; then wire them into `App`, `EditorPane`, `PreviewPane`, and styles.

**Tech Stack:** Vite, React, TypeScript, Mermaid, Vitest, Testing Library, Playwright, browser Canvas/SVG APIs.

---

## File Structure

- Create: `src/lib/source.ts` - normalize raw Mermaid vs fenced Markdown input.
- Create: `src/lib/source.test.ts` - source normalization tests.
- Create: `src/lib/templates.ts` - Mermaid template catalog.
- Create: `src/lib/templates.test.ts` - template shape tests.
- Create: `src/lib/viewOptions.ts` - render mode, style, zoom constants/helpers.
- Create: `src/lib/viewOptions.test.ts` - zoom clamp and option tests.
- Create: `src/lib/pngExport.ts` - SVG-to-PNG export helper.
- Create: `src/lib/pngExport.test.ts` - dimension derivation/unit tests.
- Modify: `src/lib/mermaidRenderer.ts` - accept render mode/style and return mode-aware SVG.
- Modify: `src/lib/svgEnhancer.ts` - support minimal vs beautified enhancement and style classes.
- Modify: `src/lib/svgEnhancer.test.ts` - cover mode/style behavior.
- Modify: `src/App.tsx` - own source, mode, style, zoom, export state.
- Modify: `src/components/EditorPane.tsx` - Mermaid-focused editor title.
- Modify: `src/components/PreviewPane.tsx` - toolbar controls, zoomed preview, export button.
- Modify: `src/components/PreviewPane.test.tsx` - control behavior tests.
- Modify: `src/styles.css` - toolbar, modes, styles, zoom presentation.
- Modify: `tests/visualizer.spec.ts` - browser tests for raw Mermaid, modes, zoom, PNG download.

## Task 1: Source Normalization and Templates

**Files:**
- Create: `src/lib/source.ts`
- Create: `src/lib/source.test.ts`
- Create: `src/lib/templates.ts`
- Create: `src/lib/templates.test.ts`
- Modify: `src/lib/defaultMarkdown.ts`

- [ ] **Step 1: Write source normalization tests**

Write `src/lib/source.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { normalizeMermaidSource } from "./source";

describe("normalizeMermaidSource", () => {
  it("returns empty for blank input", () => {
    expect(normalizeMermaidSource("  \n\t")).toEqual({ found: false, code: "" });
  });

  it("returns raw Mermaid code when no fenced block exists", () => {
    expect(normalizeMermaidSource("flowchart TD\n  A --> B")).toEqual({
      found: true,
      code: "flowchart TD\n  A --> B"
    });
  });

  it("extracts fenced Mermaid code for backward compatibility", () => {
    expect(normalizeMermaidSource("# Notes\n\n```mermaid\nflowchart LR\nA --> B\n```")).toEqual({
      found: true,
      code: "flowchart LR\nA --> B"
    });
  });
});
```

- [ ] **Step 2: Write template tests**

Write `src/lib/templates.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { mermaidTemplates } from "./templates";

describe("mermaidTemplates", () => {
  it("contains common Mermaid examples with unique ids", () => {
    const ids = new Set(mermaidTemplates.map((template) => template.id));

    expect(ids.size).toBe(mermaidTemplates.length);
    expect(mermaidTemplates.length).toBeGreaterThanOrEqual(4);
    expect(mermaidTemplates.every((template) => template.label && template.code.includes("\n"))).toBe(true);
  });

  it("includes a flowchart template", () => {
    expect(mermaidTemplates.some((template) => template.id === "flowchart")).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- src/lib/source.test.ts src/lib/templates.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement source normalization**

Write `src/lib/source.ts`:

```ts
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
```

- [ ] **Step 5: Implement templates and direct default source**

Write `src/lib/templates.ts`:

```ts
export type MermaidTemplate = {
  id: "flowchart" | "sequence" | "class" | "state";
  label: string;
  code: string;
};

export const mermaidTemplates: MermaidTemplate[] = [
  {
    id: "flowchart",
    label: "Flowchart",
    code: `flowchart TD
  A[Paste Mermaid Code] --> B{Choose Mode}
  B -- Standard --> C[Render Mermaid]
  B -- Beautified --> D[Apply Visual Style]
  C --> E[Preview]
  D --> E
  E --> F[Export PNG]`
  },
  {
    id: "sequence",
    label: "Sequence",
    code: `sequenceDiagram
  participant User
  participant App
  User->>App: Paste Mermaid code
  App-->>User: Render preview
  User->>App: Export PNG`
  },
  {
    id: "class",
    label: "Class",
    code: `classDiagram
  class Renderer {
    +render(source)
    +exportPng()
  }
  class Theme {
    +mode
    +style
  }
  Renderer --> Theme`
  },
  {
    id: "state",
    label: "State",
    code: `stateDiagram-v2
  [*] --> Editing
  Editing --> Rendering
  Rendering --> Preview
  Rendering --> Error
  Preview --> Exporting
  Exporting --> Preview`
  }
];
```

Replace `src/lib/defaultMarkdown.ts` with:

```ts
import { mermaidTemplates } from "./templates";

export const defaultMarkdown = mermaidTemplates[0].code;
```

- [ ] **Step 6: Run tests**

Run: `npm test -- src/lib/source.test.ts src/lib/templates.test.ts src/lib/markdown.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/source.ts src/lib/source.test.ts src/lib/templates.ts src/lib/templates.test.ts src/lib/defaultMarkdown.ts
git commit -m "feat: add mermaid source normalization and templates"
```

## Task 2: Render Modes, Styles, and SVG Enhancement

**Files:**
- Create: `src/lib/viewOptions.ts`
- Create: `src/lib/viewOptions.test.ts`
- Modify: `src/lib/svgEnhancer.ts`
- Modify: `src/lib/svgEnhancer.test.ts`
- Modify: `src/lib/mermaidRenderer.ts`

- [ ] **Step 1: Write option tests**

Write `src/lib/viewOptions.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { clampZoom, renderModes, visualStyles } from "./viewOptions";

describe("viewOptions", () => {
  it("defines two render modes and four styles", () => {
    expect(renderModes.map((mode) => mode.id)).toEqual(["standard", "beautified"]);
    expect(visualStyles.map((style) => style.id)).toEqual(["product-saas", "classic", "soft-color", "dark"]);
  });

  it("clamps zoom", () => {
    expect(clampZoom(20)).toBe(50);
    expect(clampZoom(110)).toBe(110);
    expect(clampZoom(240)).toBe(200);
  });
});
```

- [ ] **Step 2: Extend SVG enhancement tests**

Append to `src/lib/svgEnhancer.test.ts`:

```ts
it("adds only minimal classes in standard mode", () => {
  const enhanced = enhanceMermaidSvg("<svg><path d=\"M0 0L1 1\" /></svg>", {
    mode: "standard",
    style: "classic"
  });

  expect(enhanced).toContain("mermaid-svg");
  expect(enhanced).not.toContain("visualizer-svg");
});

it("adds beautified style classes in beautified mode", () => {
  const enhanced = enhanceMermaidSvg("<svg><path class=\"flowchart-link\" d=\"M0 0L1 1\" /></svg>", {
    mode: "beautified",
    style: "dark"
  });

  expect(enhanced).toContain("visualizer-svg");
  expect(enhanced).toContain("visualizer-style-dark");
  expect(enhanced).toContain("stroke-width=\"2.2\"");
});
```

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test -- src/lib/viewOptions.test.ts src/lib/svgEnhancer.test.ts`

Expected: FAIL because `viewOptions.ts` does not exist and `enhanceMermaidSvg` has no options parameter.

- [ ] **Step 4: Implement options**

Write `src/lib/viewOptions.ts`:

```ts
export type RenderMode = "standard" | "beautified";
export type VisualStyle = "product-saas" | "classic" | "soft-color" | "dark";

export const renderModes: Array<{ id: RenderMode; label: string }> = [
  { id: "standard", label: "Standard" },
  { id: "beautified", label: "Beautified" }
];

export const visualStyles: Array<{ id: VisualStyle; label: string }> = [
  { id: "product-saas", label: "Product SaaS" },
  { id: "classic", label: "Classic" },
  { id: "soft-color", label: "Soft Color" },
  { id: "dark", label: "Dark" }
];

export const MIN_ZOOM = 50;
export const MAX_ZOOM = 200;
export const DEFAULT_ZOOM = 100;
export const ZOOM_STEP = 10;

export function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)));
}
```

- [ ] **Step 5: Update SVG enhancement**

Modify `src/lib/svgEnhancer.ts` so `enhanceMermaidSvg` accepts options:

```ts
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
```

- [ ] **Step 6: Update Mermaid renderer**

Modify `src/lib/mermaidRenderer.ts`:

```ts
import mermaid from "mermaid";

import { enhanceMermaidSvg } from "./svgEnhancer";
import type { RenderMode, VisualStyle } from "./viewOptions";

export type MermaidRenderResult =
  | { status: "success"; svg: string }
  | { status: "error"; message: string };

export type MermaidRenderOptions = {
  mode: RenderMode;
  style: VisualStyle;
};
```

Change `renderMermaidDiagram` signature and enhancement call:

```ts
export async function renderMermaidDiagram(
  source: string,
  options: MermaidRenderOptions = { mode: "beautified", style: "product-saas" }
): Promise<MermaidRenderResult> {
  try {
    initializeMermaid();

    renderCounter += 1;
    const id = `mermaid-visualizer-${Date.now()}-${renderCounter}`;
    const { svg } = await mermaid.render(id, source);

    return {
      status: "success",
      svg: enhanceMermaidSvg(svg, options)
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test -- src/lib/viewOptions.test.ts src/lib/svgEnhancer.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/viewOptions.ts src/lib/viewOptions.test.ts src/lib/svgEnhancer.ts src/lib/svgEnhancer.test.ts src/lib/mermaidRenderer.ts
git commit -m "feat: add render modes and visual styles"
```

## Task 3: PNG Export Helper

**Files:**
- Create: `src/lib/pngExport.ts`
- Create: `src/lib/pngExport.test.ts`

- [ ] **Step 1: Write unit tests**

Write `src/lib/pngExport.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { getSvgExportDimensions } from "./pngExport";

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

  it("returns null when no dimensions are available", () => {
    expect(getSvgExportDimensions("<svg></svg>")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/lib/pngExport.test.ts`

Expected: FAIL because `pngExport.ts` does not exist.

- [ ] **Step 3: Implement PNG export helper**

Write `src/lib/pngExport.ts`:

```ts
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
```

- [ ] **Step 4: Run tests and build**

Run: `npm test -- src/lib/pngExport.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pngExport.ts src/lib/pngExport.test.ts
git commit -m "feat: add full diagram png export helper"
```

## Task 4: App State and Preview Toolbar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/EditorPane.tsx`
- Modify: `src/components/PreviewPane.tsx`
- Modify: `src/components/PreviewPane.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Update PreviewPane tests**

Extend `src/components/PreviewPane.test.tsx` with:

```ts
it("disables PNG export when preview is not successful", () => {
  render(
    <PreviewPane
      state={{ type: "empty" }}
      renderMode="beautified"
      visualStyle="product-saas"
      zoom={100}
      exportMessage={null}
      onRenderModeChange={() => undefined}
      onVisualStyleChange={() => undefined}
      onZoomOut={() => undefined}
      onZoomIn={() => undefined}
      onZoomReset={() => undefined}
      onExportPng={() => undefined}
    />
  );

  expect(screen.getByRole("button", { name: "Export PNG" })).toBeDisabled();
});

it("calls render mode and zoom handlers", () => {
  const onRenderModeChange = vi.fn();
  const onZoomIn = vi.fn();

  render(
    <PreviewPane
      state={{ type: "success", svg: "<svg></svg>" }}
      renderMode="standard"
      visualStyle="product-saas"
      zoom={100}
      exportMessage={null}
      onRenderModeChange={onRenderModeChange}
      onVisualStyleChange={() => undefined}
      onZoomOut={() => undefined}
      onZoomIn={onZoomIn}
      onZoomReset={() => undefined}
      onExportPng={() => undefined}
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Beautified" }));
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

  expect(onRenderModeChange).toHaveBeenCalledWith("beautified");
  expect(onZoomIn).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/components/PreviewPane.test.tsx`

Expected: FAIL because props and controls are not implemented.

- [ ] **Step 3: Update App state**

Modify `src/App.tsx` to use `normalizeMermaidSource`, templates, options, zoom, and export:

```tsx
import { useEffect, useMemo, useState } from "react";

import { EditorPane } from "./components/EditorPane";
import { PreviewPane, type PreviewState } from "./components/PreviewPane";
import { SplitPane } from "./components/SplitPane";
import { defaultMarkdown } from "./lib/defaultMarkdown";
import { useDebouncedValue } from "./lib/debounce";
import { exportSvgToPng } from "./lib/pngExport";
import { normalizeMermaidSource } from "./lib/source";
import { clampZoom, DEFAULT_ZOOM, type RenderMode, type VisualStyle, ZOOM_STEP } from "./lib/viewOptions";
import { renderMermaidDiagram } from "./lib/mermaidRenderer";

export default function App() {
  const [source, setSource] = useState(defaultMarkdown);
  const [previewState, setPreviewState] = useState<PreviewState>({ type: "loading" });
  const [renderMode, setRenderMode] = useState<RenderMode>("beautified");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("product-saas");
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const debouncedSource = useDebouncedValue(source, 250);
  const mermaidSource = useMemo(() => normalizeMermaidSource(debouncedSource), [debouncedSource]);

  useEffect(() => {
    let isStale = false;
    setExportMessage(null);

    if (!mermaidSource.found || mermaidSource.code.trim().length === 0) {
      setPreviewState({ type: "empty" });
      return () => {
        isStale = true;
      };
    }

    setPreviewState({ type: "loading" });

    void renderMermaidDiagram(mermaidSource.code, { mode: renderMode, style: visualStyle }).then((result) => {
      if (isStale) {
        return;
      }

      if (result.status === "success") {
        setPreviewState({ type: "success", svg: result.svg });
        return;
      }

      setPreviewState({ type: "error", message: result.message });
    });

    return () => {
      isStale = true;
    };
  }, [mermaidSource, renderMode, visualStyle]);

  const handleExportPng = async () => {
    if (previewState.type !== "success") {
      return;
    }

    try {
      await exportSvgToPng(previewState.svg, { filename: "mermaid-diagram.png", scale: 2 });
      setExportMessage("PNG exported.");
    } catch (error) {
      setExportMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <main className="app-shell">
      <SplitPane
        storageKey="mermaid-visualizer-left-width"
        left={<EditorPane value={source} onChange={setSource} />}
        right={
          <PreviewPane
            state={previewState}
            renderMode={renderMode}
            visualStyle={visualStyle}
            zoom={zoom}
            exportMessage={exportMessage}
            onRenderModeChange={setRenderMode}
            onVisualStyleChange={setVisualStyle}
            onZoomOut={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
            onZoomIn={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
            onZoomReset={() => setZoom(DEFAULT_ZOOM)}
            onExportPng={handleExportPng}
          />
        }
      />
    </main>
  );
}
```

- [ ] **Step 4: Update editor copy**

Modify `src/components/EditorPane.tsx`:

```tsx
type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
};

export function EditorPane({ value, onChange }: EditorPaneProps) {
  return (
    <section className="tool-pane editor-pane">
      <header className="pane-header">
        <div>
          <h1>Mermaid Code</h1>
          <p>Paste Mermaid code directly, or keep using a fenced mermaid Markdown block.</p>
        </div>
      </header>
      <textarea
        aria-label="Mermaid code input"
        className="markdown-editor"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
```

- [ ] **Step 5: Update PreviewPane props and toolbar**

Modify `src/components/PreviewPane.tsx` to import options and accept:

```ts
import { renderModes, visualStyles, type RenderMode, type VisualStyle } from "../lib/viewOptions";
```

Extend props:

```ts
type PreviewPaneProps = {
  state: PreviewState;
  renderMode: RenderMode;
  visualStyle: VisualStyle;
  zoom: number;
  exportMessage: string | null;
  onRenderModeChange: (mode: RenderMode) => void;
  onVisualStyleChange: (style: VisualStyle) => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onZoomReset: () => void;
  onExportPng: () => void;
};
```

Add toolbar inside header after title block:

```tsx
<div className="preview-toolbar" aria-label="Preview controls">
  <div className="segmented-control" aria-label="Render mode">
    {renderModes.map((mode) => (
      <button
        key={mode.id}
        type="button"
        className={mode.id === renderMode ? "is-active" : ""}
        aria-pressed={mode.id === renderMode}
        onClick={() => onRenderModeChange(mode.id)}
      >
        {mode.label}
      </button>
    ))}
  </div>
  <label className="toolbar-select-label">
    Style
    <select value={visualStyle} onChange={(event) => onVisualStyleChange(event.target.value as VisualStyle)}>
      {visualStyles.map((style) => (
        <option key={style.id} value={style.id}>
          {style.label}
        </option>
      ))}
    </select>
  </label>
  <div className="zoom-controls" aria-label="Zoom controls">
    <button type="button" aria-label="Zoom out" onClick={onZoomOut}>-</button>
    <button type="button" aria-label="Reset zoom" onClick={onZoomReset}>{zoom}%</button>
    <button type="button" aria-label="Zoom in" onClick={onZoomIn}>+</button>
  </div>
  <button type="button" className="toolbar-button" disabled={state.type !== "success"} onClick={onExportPng}>
    Export PNG
  </button>
</div>
```

Wrap success surface with zoom style:

```tsx
<div
  className="diagram-surface"
  aria-label="Rendered Mermaid diagram"
  style={{ transform: `scale(${zoom / 100})` }}
  dangerouslySetInnerHTML={{ __html: state.svg }}
/>
```

Render export message after toolbar:

```tsx
{exportMessage ? <p className="export-message">{exportMessage}</p> : null}
```

- [ ] **Step 6: Add toolbar CSS**

Append to `src/styles.css`:

```css
.preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.segmented-control,
.zoom-controls {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid #c8d3df;
  border-radius: 7px;
  background: #ffffff;
}

.segmented-control button,
.zoom-controls button,
.toolbar-button,
.toolbar-select-label select {
  min-height: 34px;
  border: 0;
  background: #ffffff;
  color: #25354a;
  font-size: 0.78rem;
  font-weight: 650;
}

.segmented-control button,
.zoom-controls button,
.toolbar-button {
  padding: 0 10px;
}

.segmented-control button.is-active {
  background: #25364d;
  color: #ffffff;
}

.toolbar-select-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #607086;
  font-size: 0.75rem;
  font-weight: 700;
}

.toolbar-select-label select {
  border: 1px solid #c8d3df;
  border-radius: 7px;
  padding: 0 8px;
}

.toolbar-button {
  border: 1px solid #c8d3df;
  border-radius: 7px;
}

.toolbar-button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.export-message {
  flex-basis: 100%;
  margin: 4px 0 0;
  color: #607086;
  font-size: 0.75rem;
}

.diagram-surface {
  transform-origin: center;
}

.visualizer-mode-standard .node rect,
.visualizer-mode-standard .node circle,
.visualizer-mode-standard .node ellipse,
.visualizer-mode-standard .node polygon,
.visualizer-mode-standard .node path {
  filter: none;
}

.visualizer-style-dark {
  background: #111827;
}

.preview-pane:has(.visualizer-style-dark) .preview-canvas {
  background: #111827;
}

.visualizer-style-soft-color .node rect,
.visualizer-style-soft-color .node polygon {
  fill: #f7fbff;
  stroke: #a7c7e7;
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test -- src/components/PreviewPane.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/components/EditorPane.tsx src/components/PreviewPane.tsx src/components/PreviewPane.test.tsx src/styles.css
git commit -m "feat: add processon-like preview controls"
```

## Task 5: Template Selector UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/EditorPane.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add template selector prop to EditorPane**

Modify `src/components/EditorPane.tsx` props:

```ts
import { mermaidTemplates, type MermaidTemplate } from "../lib/templates";

type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
  onTemplateSelect: (template: MermaidTemplate) => void;
};
```

Add a select in header:

```tsx
<label className="toolbar-select-label">
  Template
  <select
    defaultValue=""
    aria-label="Mermaid template"
    onChange={(event) => {
      const template = mermaidTemplates.find((item) => item.id === event.target.value);
      if (template) {
        onTemplateSelect(template);
        event.currentTarget.value = "";
      }
    }}
  >
    <option value="" disabled>
      Choose
    </option>
    {mermaidTemplates.map((template) => (
      <option key={template.id} value={template.id}>
        {template.label}
      </option>
    ))}
  </select>
</label>
```

- [ ] **Step 2: Wire App**

Modify `src/App.tsx` EditorPane usage:

```tsx
left={
  <EditorPane
    value={source}
    onChange={setSource}
    onTemplateSelect={(template) => {
      setSource(template.code);
      setZoom(DEFAULT_ZOOM);
      setExportMessage(null);
    }}
  />
}
```

- [ ] **Step 3: Add small CSS if needed**

If the editor header needs layout room, add:

```css
.editor-pane .pane-header {
  align-items: center;
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/EditorPane.tsx src/styles.css
git commit -m "feat: add mermaid template selector"
```

## Task 6: Browser Smoke Tests

**Files:**
- Modify: `tests/visualizer.spec.ts`

- [ ] **Step 1: Update Playwright tests**

Replace `tests/visualizer.spec.ts` with:

```ts
import { expect, test } from "@playwright/test";

test("renders raw Mermaid code in beautified mode", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Mermaid code input" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visual Preview" })).toBeVisible();
  await expect(page.locator(".diagram-surface svg.visualizer-svg")).toBeVisible({ timeout: 10_000 });
});

test("switches to standard mode", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Standard" }).click();

  await expect(page.locator(".diagram-surface svg.visualizer-mode-standard")).toBeVisible({
    timeout: 10_000
  });
});

test("shows empty state when no Mermaid source exists", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Mermaid code input" }).fill("");

  await expect(page.getByText("Add a fenced")).toBeVisible();
});

test("shows error state for invalid Mermaid syntax", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Mermaid code input" }).fill(`flowchart LR
A -->`);

  await expect(page.getByText("Mermaid render failed")).toBeVisible({ timeout: 10_000 });
});

test("zooms preview and exports PNG", async ({ page }) => {
  await page.goto("/");

  const surface = page.locator(".diagram-surface");
  await expect(surface).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByRole("button", { name: "Reset zoom" })).toContainText("110%");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("mermaid-diagram.png");
});
```

- [ ] **Step 2: Run e2e**

Run: `npm run test:e2e`

Expected: PASS.

- [ ] **Step 3: Run all verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/visualizer.spec.ts
git commit -m "test: cover processon-like mermaid workflow"
```

## Task 7: Visual QA and Final Polish

**Files:**
- Modify if needed: `src/styles.css`
- Modify if needed: `src/components/PreviewPane.tsx`
- Modify if needed: `src/components/EditorPane.tsx`
- Modify if needed: `src/lib/pngExport.ts`

- [ ] **Step 1: Start dev server**

Run: `npm run dev -- --host 127.0.0.1 --port 5175`

Expected: Vite serves `http://127.0.0.1:5175/`.

- [ ] **Step 2: Browser QA**

Open `http://127.0.0.1:5175/` and verify:

- Raw Mermaid code renders without requiring Markdown fences.
- Standard mode shows a chart without `visualizer-svg`.
- Beautified mode shows enhanced styling.
- Style selector visibly changes preview classes or colors.
- Template selector replaces editor text and re-renders.
- Zoom controls update scale and label.
- PNG export downloads `mermaid-diagram.png`.
- Empty and error states still work.
- Mobile viewport remains usable.

- [ ] **Step 3: Fix polish issues**

If QA finds clipping, overlap, unreadable controls, broken export, or console errors, make the smallest targeted fix.

- [ ] **Step 4: Final verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 5: Commit final polish if changed**

If files changed:

```bash
git add src/styles.css src/components/PreviewPane.tsx src/components/EditorPane.tsx src/lib/pngExport.ts
git commit -m "polish: refine processon-like mermaid workflow"
```

If no files changed, do not create an empty commit.

## Self-Review

Spec coverage:

- Direct Mermaid code input: Task 1 and Task 4.
- Backward-compatible fenced Markdown: Task 1.
- Chart preview: Task 2 and Task 4.
- Standard/Beautified modes: Task 2 and Task 4.
- Style selector: Task 2 and Task 4.
- Templates: Task 1 and Task 5.
- Zoom controls: Task 2 and Task 4.
- Complete PNG export: Task 3, Task 4, and Task 6.
- Browser smoke tests: Task 6.
- Final rendered QA: Task 7.

Placeholder scan:

- No placeholder markers or incomplete implementation steps are intentionally left in this plan.

Type consistency:

- `RenderMode`, `VisualStyle`, `MermaidTemplate`, and PNG export helper names are defined before use and reused consistently across tasks.

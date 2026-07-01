# Mermaid Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure frontend single-page Markdown Mermaid visualizer with resizable panes, fullscreen preview, and Product SaaS / Soft Orthogonal visual styling.

**Architecture:** Create a Vite + React + TypeScript app. Keep Markdown extraction, Mermaid rendering, SVG enhancement, split-pane state, and UI components in separate focused files so each piece can be tested independently.

**Tech Stack:** Vite, React, TypeScript, Mermaid, Vitest, Testing Library, Playwright.

---

## File Structure

- Create: `package.json` - scripts and dependencies.
- Create: `index.html` - Vite HTML entry.
- Create: `tsconfig.json` - TypeScript config for app.
- Create: `tsconfig.node.json` - TypeScript config for Vite/Vitest config files.
- Create: `vite.config.ts` - Vite and Vitest configuration.
- Create: `playwright.config.ts` - browser smoke test configuration.
- Create: `src/main.tsx` - React mount point.
- Create: `src/App.tsx` - application composition and state wiring.
- Create: `src/styles.css` - global layout and Product SaaS visual styling.
- Create: `src/lib/defaultMarkdown.ts` - default sample Markdown.
- Create: `src/lib/markdown.ts` - pure Mermaid code fence extraction.
- Create: `src/lib/markdown.test.ts` - extraction unit tests.
- Create: `src/lib/debounce.ts` - small debounce hook/helper.
- Create: `src/lib/mermaidRenderer.ts` - Mermaid initialization and render wrapper.
- Create: `src/lib/svgEnhancer.ts` - DOM-based SVG style normalization.
- Create: `src/lib/svgEnhancer.test.ts` - SVG enhancement unit tests.
- Create: `src/components/EditorPane.tsx` - left Markdown editor.
- Create: `src/components/PreviewPane.tsx` - right preview state and fullscreen trigger.
- Create: `src/components/SplitPane.tsx` - draggable split layout with persistence.
- Create: `src/components/SplitPane.test.tsx` - split width tests.
- Create: `tests/visualizer.spec.ts` - Playwright visual smoke test.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `playwright.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create package scripts and dependencies**

Write `package.json`:

```json
{
  "name": "mermaid-visualizer",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "mermaid": "^11.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.45.0",
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^7.0.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create Vite HTML entry**

Write `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mermaid Visualizer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript configs**

Write `tsconfig.json`:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "tests"]
}
```

Write `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "playwright.config.ts"]
}
```

- [ ] **Step 4: Create Vite and test configuration**

Write `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['@testing-library/jest-dom/vitest'],
  },
});
```

Write `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

- [ ] **Step 5: Create minimal React entry**

Write `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Write `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="placeholder-panel">
        <h1>Mermaid Visualizer</h1>
        <p>Project scaffold is ready.</p>
      </section>
    </main>
  );
}
```

Write `src/styles.css`:

```css
:root {
  color: #24364b;
  background: #edf2f7;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
}

button,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100%;
  padding: 24px;
}

.placeholder-panel {
  min-height: calc(100vh - 48px);
  display: grid;
  place-content: center;
  border: 1px solid #d8e1ec;
  background: #ffffff;
}
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: command exits `0` and creates `package-lock.json`.

- [ ] **Step 7: Build scaffold**

Run: `npm run build`

Expected: command exits `0` and `dist/` is created.

- [ ] **Step 8: Commit scaffold**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts playwright.config.ts src/main.tsx src/App.tsx src/styles.css
git commit -m "chore: scaffold frontend app"
```

## Task 2: Markdown Extraction

**Files:**
- Create: `src/lib/defaultMarkdown.ts`
- Create: `src/lib/markdown.ts`
- Create: `src/lib/markdown.test.ts`

- [ ] **Step 1: Write failing extraction tests**

Write `src/lib/markdown.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { extractFirstMermaidBlock } from './markdown';

describe('extractFirstMermaidBlock', () => {
  it('extracts the first mermaid fenced block', () => {
    const markdown = [
      '# Flow',
      '',
      '```mermaid',
      'flowchart LR',
      '  A[Input] --> B[Preview]',
      '```',
    ].join('\n');

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      code: 'flowchart LR\n  A[Input] --> B[Preview]',
      found: true,
    });
  });

  it('is case-insensitive for the fence language', () => {
    const markdown = '```Mermaid\nflowchart TD\nA --> B\n```';

    expect(extractFirstMermaidBlock(markdown)).toEqual({
      code: 'flowchart TD\nA --> B',
      found: true,
    });
  });

  it('returns an empty result when no mermaid fence exists', () => {
    expect(extractFirstMermaidBlock('# Notes\n\nNo diagram here.')).toEqual({
      code: '',
      found: false,
    });
  });

  it('extracts only the first mermaid block', () => {
    const markdown = [
      '```mermaid',
      'flowchart LR',
      'A --> B',
      '```',
      '',
      '```mermaid',
      'flowchart LR',
      'C --> D',
      '```',
    ].join('\n');

    expect(extractFirstMermaidBlock(markdown).code).toBe('flowchart LR\nA --> B');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/markdown.test.ts`

Expected: FAIL because `src/lib/markdown.ts` does not exist.

- [ ] **Step 3: Implement Markdown extraction and sample**

Write `src/lib/markdown.ts`:

```ts
export type MermaidBlockResult =
  | { found: true; code: string }
  | { found: false; code: '' };

const MERMAID_FENCE_PATTERN = /```[ \t]*mermaid[^\n]*\n([\s\S]*?)```/i;

export function extractFirstMermaidBlock(markdown: string): MermaidBlockResult {
  const match = markdown.match(MERMAID_FENCE_PATTERN);

  if (!match?.[1]) {
    return { found: false, code: '' };
  }

  return {
    found: true,
    code: match[1].trim(),
  };
}
```

Write `src/lib/defaultMarkdown.ts`:

```ts
export const defaultMarkdown = `# Product Flow

\`\`\`mermaid
flowchart LR
  A[Paste Markdown] --> B{Find Mermaid}
  B -- Found --> C[Parse Flowchart]
  B -- Missing --> D[Show Empty State]
  C --> E[Render SVG]
  E --> F[Polish Lines]
  F --> G[Visual Preview]
\`\`\`
`;
```

- [ ] **Step 4: Run unit tests**

Run: `npm test -- src/lib/markdown.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit extraction module**

```bash
git add src/lib/defaultMarkdown.ts src/lib/markdown.ts src/lib/markdown.test.ts
git commit -m "feat: extract mermaid code blocks"
```

## Task 3: SVG Enhancement Layer

**Files:**
- Create: `src/lib/svgEnhancer.ts`
- Create: `src/lib/svgEnhancer.test.ts`

- [ ] **Step 1: Write failing SVG enhancement tests**

Write `src/lib/svgEnhancer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { enhanceMermaidSvg } from './svgEnhancer';

describe('enhanceMermaidSvg', () => {
  it('adds the visualizer class and accessible focus marker', () => {
    const svg = '<svg viewBox="0 0 10 10"><g class="node"><rect /></g></svg>';

    const enhanced = enhanceMermaidSvg(svg);

    expect(enhanced).toContain('class="mermaid-svg visualizer-svg"');
    expect(enhanced).toContain('data-enhanced="true"');
  });

  it('normalizes path line caps and joins', () => {
    const svg = '<svg><path class="flowchart-link" d="M0 0L10 10" /></svg>';

    const enhanced = enhanceMermaidSvg(svg);

    expect(enhanced).toContain('stroke-linecap="round"');
    expect(enhanced).toContain('stroke-linejoin="round"');
  });

  it('returns the original markup when parsing fails', () => {
    const invalid = '<svg><path>';

    expect(enhanceMermaidSvg(invalid)).toBe(invalid);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/svgEnhancer.test.ts`

Expected: FAIL because `src/lib/svgEnhancer.ts` does not exist.

- [ ] **Step 3: Implement SVG enhancement**

Write `src/lib/svgEnhancer.ts`:

```ts
export function enhanceMermaidSvg(svgMarkup: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const parseError = document.querySelector('parsererror');
  const svg = document.querySelector('svg');

  if (parseError || !svg) {
    return svgMarkup;
  }

  svg.classList.add('visualizer-svg');
  svg.setAttribute('data-enhanced', 'true');
  svg.setAttribute('role', 'img');

  const paths = svg.querySelectorAll('path');
  paths.forEach((path) => {
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
  });

  const edgePaths = svg.querySelectorAll('.flowchart-link, .edge-thickness-normal');
  edgePaths.forEach((edge) => {
    edge.setAttribute('stroke-width', '2.2');
  });

  return new XMLSerializer().serializeToString(svg);
}
```

- [ ] **Step 4: Run enhancement tests**

Run: `npm test -- src/lib/svgEnhancer.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit enhancement layer**

```bash
git add src/lib/svgEnhancer.ts src/lib/svgEnhancer.test.ts
git commit -m "feat: add svg visual enhancement"
```

## Task 4: Mermaid Renderer

**Files:**
- Create: `src/lib/mermaidRenderer.ts`
- Modify: `src/lib/svgEnhancer.ts`

- [ ] **Step 1: Implement Mermaid render wrapper**

Write `src/lib/mermaidRenderer.ts`:

```ts
import mermaid from 'mermaid';
import { enhanceMermaidSvg } from './svgEnhancer';

export type MermaidRenderResult =
  | { status: 'success'; svg: string }
  | { status: 'error'; message: string };

let initialized = false;
let renderCounter = 0;

export function initializeMermaid() {
  if (initialized) {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    flowchart: {
      curve: 'basis',
      htmlLabels: false,
      nodeSpacing: 56,
      rankSpacing: 72,
      padding: 18,
    },
    theme: 'base',
    themeVariables: {
      background: '#f6f8fb',
      primaryColor: '#ffffff',
      primaryBorderColor: '#d8e1ec',
      primaryTextColor: '#24364b',
      lineColor: '#607086',
      arrowheadColor: '#607086',
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '15px',
      edgeLabelBackground: '#f6f8fb',
      clusterBkg: '#ffffff',
      clusterBorder: '#d8e1ec',
    },
  });

  initialized = true;
}

export async function renderMermaidDiagram(source: string): Promise<MermaidRenderResult> {
  initializeMermaid();

  try {
    const id = `mermaid-visualizer-${Date.now()}-${renderCounter++}`;
    const { svg } = await mermaid.render(id, source);
    return { status: 'success', svg: enhanceMermaidSvg(svg) };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
```

- [ ] **Step 2: Run renderer build check**

Run: `npm run build`

Expected: PASS. If Mermaid types reject a flowchart option, remove only that unsupported option and keep the rest of the theme intact.

- [ ] **Step 3: Commit renderer**

```bash
git add src/lib/mermaidRenderer.ts
git commit -m "feat: render mermaid diagrams"
```

## Task 5: Split Pane Interaction

**Files:**
- Create: `src/components/SplitPane.tsx`
- Create: `src/components/SplitPane.test.tsx`

- [ ] **Step 1: Write failing split pane tests**

Write `src/components/SplitPane.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { SplitPane } from './SplitPane';

describe('SplitPane', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders both panes', () => {
    render(
      <SplitPane left={<div>Left</div>} right={<div>Right</div>} storageKey="test-split" />,
    );

    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('persists the split width after dragging', () => {
    render(
      <div style={{ width: 1000 }}>
        <SplitPane left={<div>Left</div>} right={<div>Right</div>} storageKey="test-split" />
      </div>,
    );

    const handle = screen.getByRole('separator');
    fireEvent.pointerDown(handle, { clientX: 420, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 520, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(Number(localStorage.getItem('test-split'))).toBeGreaterThan(30);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/SplitPane.test.tsx`

Expected: FAIL because `src/components/SplitPane.tsx` does not exist.

- [ ] **Step 3: Implement split pane**

Write `src/components/SplitPane.tsx`:

```tsx
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

type SplitPaneProps = {
  left: ReactNode;
  right: ReactNode;
  storageKey: string;
};

const MIN_LEFT_PERCENT = 28;
const MAX_LEFT_PERCENT = 68;
const DEFAULT_LEFT_PERCENT = 42;

function clamp(value: number) {
  return Math.min(MAX_LEFT_PERCENT, Math.max(MIN_LEFT_PERCENT, value));
}

export function SplitPane({ left, right, storageKey }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(() => {
    const stored = Number(localStorage.getItem(storageKey));
    return Number.isFinite(stored) && stored > 0 ? clamp(stored) : DEFAULT_LEFT_PERCENT;
  });

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const nextPercent = clamp(((clientX - rect.left) / rect.width) * 100);
      setLeftPercent(nextPercent);
      localStorage.setItem(storageKey, String(nextPercent));
    },
    [storageKey],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.buttons !== 1) {
        return;
      }
      updateFromClientX(event.clientX);
    };

    const handlePointerUp = () => {
      document.body.classList.remove('is-resizing');
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [updateFromClientX]);

  return (
    <div
      className="split-pane"
      ref={containerRef}
      style={{ gridTemplateColumns: `${leftPercent}% 10px minmax(0, 1fr)` }}
    >
      <div className="split-pane__panel split-pane__panel--left">{left}</div>
      <button
        aria-label="Resize panes"
        aria-orientation="vertical"
        className="split-pane__divider"
        role="separator"
        type="button"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          document.body.classList.add('is-resizing');
          updateFromClientX(event.clientX);
        }}
      >
        <span />
      </button>
      <div className="split-pane__panel split-pane__panel--right">{right}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run split pane tests**

Run: `npm test -- src/components/SplitPane.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit split pane**

```bash
git add src/components/SplitPane.tsx src/components/SplitPane.test.tsx
git commit -m "feat: add resizable split pane"
```

## Task 6: Editor and Preview UI

**Files:**
- Create: `src/components/EditorPane.tsx`
- Create: `src/components/PreviewPane.tsx`
- Create: `src/lib/debounce.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement debounce hook**

Write `src/lib/debounce.ts`:

```ts
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
```

- [ ] **Step 2: Implement editor pane**

Write `src/components/EditorPane.tsx`:

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
          <h1>Markdown Input</h1>
          <p>Paste Markdown containing a mermaid code block.</p>
        </div>
      </header>
      <textarea
        aria-label="Markdown input"
        className="markdown-editor"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
```

- [ ] **Step 3: Implement preview pane**

Write `src/components/PreviewPane.tsx`:

```tsx
import { useRef, useState } from 'react';

export type PreviewState =
  | { type: 'empty' }
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'success'; svg: string };

type PreviewPaneProps = {
  state: PreviewState;
};

export function PreviewPane({ state }: PreviewPaneProps) {
  const paneRef = useRef<HTMLElement>(null);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);

  async function toggleFullscreen() {
    const pane = paneRef.current;
    if (!pane) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    try {
      await pane.requestFullscreen();
    } catch {
      setFallbackFullscreen((current) => !current);
    }
  }

  return (
    <section
      className={`tool-pane preview-pane ${fallbackFullscreen ? 'preview-pane--fullscreen' : ''}`}
      ref={paneRef}
    >
      <header className="pane-header">
        <div>
          <h1>Visual Preview</h1>
          <p>Product SaaS rendering with Soft Orthogonal line styling.</p>
        </div>
        <button className="icon-button" type="button" onClick={toggleFullscreen}>
          Fullscreen
        </button>
      </header>
      <div className="preview-canvas" data-testid="preview-canvas">
        {state.type === 'loading' && <div className="state-panel">Rendering diagram...</div>}
        {state.type === 'empty' && (
          <div className="state-panel">
            Add a fenced <code>mermaid</code> code block to preview a flowchart.
          </div>
        )}
        {state.type === 'error' && (
          <div className="state-panel state-panel--error">
            <strong>Mermaid render failed</strong>
            <pre>{state.message}</pre>
          </div>
        )}
        {state.type === 'success' && (
          <div
            aria-label="Rendered Mermaid diagram"
            className="diagram-surface"
            dangerouslySetInnerHTML={{ __html: state.svg }}
          />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire the app state**

Replace `src/App.tsx` with:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { EditorPane } from './components/EditorPane';
import { PreviewPane, PreviewState } from './components/PreviewPane';
import { SplitPane } from './components/SplitPane';
import { defaultMarkdown } from './lib/defaultMarkdown';
import { useDebouncedValue } from './lib/debounce';
import { extractFirstMermaidBlock } from './lib/markdown';
import { renderMermaidDiagram } from './lib/mermaidRenderer';

export default function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [previewState, setPreviewState] = useState<PreviewState>({ type: 'loading' });
  const debouncedMarkdown = useDebouncedValue(markdown, 250);

  const mermaidBlock = useMemo(
    () => extractFirstMermaidBlock(debouncedMarkdown),
    [debouncedMarkdown],
  );

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!mermaidBlock.found) {
        setPreviewState({ type: 'empty' });
        return;
      }

      setPreviewState({ type: 'loading' });
      const result = await renderMermaidDiagram(mermaidBlock.code);

      if (cancelled) {
        return;
      }

      if (result.status === 'success') {
        setPreviewState({ type: 'success', svg: result.svg });
      } else {
        setPreviewState({ type: 'error', message: result.message });
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [mermaidBlock]);

  return (
    <main className="app-shell">
      <SplitPane
        storageKey="mermaid-visualizer-left-width"
        left={<EditorPane value={markdown} onChange={setMarkdown} />}
        right={<PreviewPane state={previewState} />}
      />
    </main>
  );
}
```

- [ ] **Step 5: Replace CSS with full Product SaaS layout**

Replace `src/styles.css` with:

```css
:root {
  color: #24364b;
  background: #edf2f7;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
}

button,
textarea {
  font: inherit;
}

button {
  border: 0;
}

.app-shell {
  width: 100%;
  height: 100vh;
  padding: 18px;
  background:
    linear-gradient(#f8fafc, #edf2f7);
}

.split-pane {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  border: 1px solid #d8e1ec;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 48px rgb(30 53 88 / 10%);
}

.split-pane__panel {
  min-width: 0;
  min-height: 0;
}

.split-pane__divider {
  display: grid;
  place-items: center;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  background: #e2e8f0;
}

.split-pane__divider span {
  width: 2px;
  height: 72px;
  border-radius: 99px;
  background: #94a3b8;
}

.split-pane__divider:hover,
.split-pane__divider:focus-visible {
  background: #d8e1ec;
  outline: none;
}

.is-resizing {
  cursor: col-resize;
  user-select: none;
}

.tool-pane {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background: #ffffff;
}

.editor-pane {
  border-right: 1px solid #d8e1ec;
}

.pane-header {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5ebf2;
  background: #f8fafc;
}

.pane-header h1 {
  margin: 0;
  color: #24364b;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
}

.pane-header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.markdown-editor {
  width: 100%;
  min-height: 0;
  flex: 1;
  resize: none;
  border: 0;
  outline: none;
  padding: 20px;
  background: #0f172a;
  color: #dbeafe;
  font: 13px/1.65 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
}

.icon-button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #24364b;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
}

.icon-button:hover,
.icon-button:focus-visible {
  border-color: #94a3b8;
  background: #f1f5f9;
  outline: none;
}

.preview-canvas {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgb(59 130 246 / 7%), transparent 28rem),
    #f6f8fb;
}

.diagram-surface {
  display: grid;
  width: 100%;
  min-height: 100%;
  place-items: center;
}

.diagram-surface svg {
  max-width: 100%;
  height: auto;
}

.visualizer-svg {
  overflow: visible;
}

.visualizer-svg .node rect,
.visualizer-svg .node polygon,
.visualizer-svg .node circle,
.visualizer-svg .node ellipse {
  fill: #ffffff !important;
  stroke: #d8e1ec !important;
  stroke-width: 1.2px !important;
  filter: drop-shadow(0 10px 18px rgb(30 53 88 / 12%));
}

.visualizer-svg .nodeLabel,
.visualizer-svg .label,
.visualizer-svg .label text,
.visualizer-svg text {
  color: #24364b !important;
  fill: #24364b !important;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif !important;
  font-size: 14px !important;
}

.visualizer-svg .flowchart-link,
.visualizer-svg .edge-thickness-normal,
.visualizer-svg path {
  stroke: #607086 !important;
  stroke-width: 2.2px !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}

.visualizer-svg marker path {
  fill: #607086 !important;
  stroke: #607086 !important;
}

.state-panel {
  max-width: 520px;
  margin: 10vh auto 0;
  padding: 18px;
  border: 1px solid #d8e1ec;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  box-shadow: 0 14px 32px rgb(30 53 88 / 8%);
}

.state-panel--error {
  border-color: #fecaca;
  color: #7f1d1d;
}

.state-panel pre {
  max-height: 260px;
  overflow: auto;
  margin: 12px 0 0;
  white-space: pre-wrap;
  font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
}

.preview-pane--fullscreen {
  position: fixed;
  inset: 18px;
  z-index: 20;
  border: 1px solid #d8e1ec;
  border-radius: 8px;
  box-shadow: 0 24px 80px rgb(15 23 42 / 22%);
}

@media (max-width: 780px) {
  .app-shell {
    padding: 0;
  }

  .split-pane {
    grid-template-columns: 1fr !important;
    grid-template-rows: 42% 10px 1fr;
    border: 0;
    border-radius: 0;
  }

  .split-pane__divider {
    width: 100%;
    height: 10px;
    cursor: row-resize;
  }

  .split-pane__divider span {
    width: 72px;
    height: 2px;
  }

  .editor-pane {
    border-right: 0;
    border-bottom: 1px solid #d8e1ec;
  }
}
```

- [ ] **Step 6: Run unit tests and build**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit UI integration**

```bash
git add src/App.tsx src/components/EditorPane.tsx src/components/PreviewPane.tsx src/lib/debounce.ts src/styles.css
git commit -m "feat: build visualizer interface"
```

## Task 7: End-to-End Smoke Test

**Files:**
- Create: `tests/visualizer.spec.ts`

- [ ] **Step 1: Write browser smoke test**

Write `tests/visualizer.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('renders the default mermaid diagram', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('textbox', { name: 'Markdown input' })).toBeVisible();
  await expect(page.getByText('Visual Preview')).toBeVisible();
  await expect(page.locator('.diagram-surface svg')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.diagram-surface svg path').first()).toHaveAttribute(
    'stroke-linecap',
    'round',
  );
});

test('shows empty state when no mermaid block exists', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('textbox', { name: 'Markdown input' }).fill('# Plain Markdown');

  await expect(page.getByText('Add a fenced')).toBeVisible();
});

test('shows error state for invalid mermaid syntax', async ({ page }) => {
  await page.goto('/');

  await page
    .getByRole('textbox', { name: 'Markdown input' })
    .fill(['```mermaid', 'flowchart LR', 'A -->', '```'].join('\n'));

  await expect(page.getByText('Mermaid render failed')).toBeVisible({ timeout: 10_000 });
});
```

- [ ] **Step 2: Install Playwright browser if needed**

Run: `npx playwright install chromium`

Expected: command exits `0`. If Chromium is already installed, Playwright reports no work or exits successfully.

- [ ] **Step 3: Run browser smoke test**

Run: `npm run test:e2e`

Expected: PASS.

- [ ] **Step 4: Commit browser tests**

```bash
git add tests/visualizer.spec.ts
git commit -m "test: add visualizer browser smoke tests"
```

## Task 8: Final Verification and Visual QA

**Files:**
- Modify if needed: `src/styles.css`
- Modify if needed: `src/lib/mermaidRenderer.ts`
- Modify if needed: `src/lib/svgEnhancer.ts`

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all commands exit `0`.

- [ ] **Step 2: Start local dev server**

Run: `npm run dev -- --port 5173`

Expected: Vite reports `http://127.0.0.1:5173/`.

- [ ] **Step 3: Visually inspect the app**

Open `http://127.0.0.1:5173/` and confirm:

- Left side contains the sample Markdown.
- Right side renders a non-empty SVG flowchart.
- Divider drag changes pane widths.
- Preview fullscreen button enters fullscreen or fallback overlay.
- Lines use the Soft Orthogonal treatment: rounded joins/caps, gray-blue stroke, restrained arrowheads.
- Nodes use Product SaaS treatment: white fill, light border, subtle shadow.

- [ ] **Step 4: Capture any polish fixes**

If visual inspection shows oversized text, cramped spacing, harsh colors, or broken fullscreen, make the smallest focused CSS or renderer adjustment and re-run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 5: Commit final polish**

If Step 4 changed files:

```bash
git add src/styles.css src/lib/mermaidRenderer.ts src/lib/svgEnhancer.ts
git commit -m "polish: refine diagram rendering"
```

If Step 4 did not change files, do not create an empty commit.

## Self-Review

Spec coverage:

- Markdown input pane: Task 6.
- Mermaid code block extraction: Task 2.
- Right-side SVG rendering: Task 4 and Task 6.
- Drag-resizable panes: Task 5 and Task 8.
- Fullscreen preview: Task 6 and Task 8.
- Pure frontend implementation: Task 1 through Task 6 use browser-only code and no backend.
- Product SaaS styling: Task 6.
- Soft Orthogonal line treatment: Task 3, Task 4, Task 6, and Task 8.
- Empty and error states: Task 6 and Task 7.
- Testing plan: Task 2, Task 3, Task 5, Task 7, and Task 8.

Placeholder scan:

- No placeholder markers or incomplete steps are intentionally left in this plan.

Type consistency:

- `PreviewState`, `MermaidRenderResult`, `MermaidBlockResult`, and component props are defined before use.
- File paths and imports are consistent across tasks.

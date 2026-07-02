# ProcessOn-Like Mermaid Upgrade Design

Date: 2026-07-02

## Goal

Upgrade the existing Mermaid visualizer into a ProcessOn-like pure frontend Mermaid tool. The tool should support direct Mermaid code input, chart rendering, beautified rendering, style selection, templates, zoom controls, and full-diagram PNG export.

This is a clean-room implementation based on publicly visible product behavior. It must not copy or depend on ProcessOn proprietary source code.

## Scope

The first upgrade includes:

- Direct Mermaid code editor as the primary input.
- Backward-compatible Markdown fenced Mermaid extraction.
- Mermaid chart preview.
- Render mode toggle: `Standard` and `Beautified`.
- Style selector for beautified rendering.
- Template selector for common Mermaid examples.
- Preview zoom controls.
- PNG export of the complete rendered chart, independent of current viewport, scroll, or zoom.

Out of scope for this upgrade:

- Backend rendering.
- ProcessOn account, storage, collaboration, or document management.
- PDF/JPG/SVG export.
- ASCII rendering.
- Full recreation of ProcessOn UI or proprietary internals.

## Product Behavior

The page remains a focused single-page tool.

Left pane:

- Header changes from Markdown-focused language to Mermaid-focused language.
- Textarea accepts raw Mermaid code.
- If the text contains a fenced `mermaid` block, the app extracts and renders that block for backward compatibility.
- Template selection replaces the editor value with a full Mermaid example.

Right pane:

- Header includes a compact toolbar.
- Toolbar controls:
  - Template selector.
  - Render mode segmented control: `Standard` / `Beautified`.
  - Style selector.
  - Zoom out, zoom in, reset zoom.
  - Export PNG button.
  - Fullscreen button remains available.

Preview states:

- Loading: render in progress.
- Empty: no Mermaid source.
- Error: Mermaid syntax or rendering error.
- Success: rendered SVG preview.

## Render Modes

### Standard

Standard mode uses Mermaid's normal SVG output with minimal post-processing:

- Keep Mermaid-generated SVG structure.
- Keep basic safety attributes.
- Do not apply Product SaaS node shadows or enhanced edge styling.
- Use this mode as the closest equivalent to default Mermaid rendering.

### Beautified

Beautified mode applies the existing visual enhancement layer:

- Product SaaS default style.
- Soft Orthogonal line treatment.
- Refined node fill, border, text, edge, arrow, and shadow styling.
- Style selector can change theme variables and CSS class hooks.

## Styles

First version style options:

- `Product SaaS`: current polished gray-blue professional style.
- `Classic`: white canvas, neutral Mermaid-like styling with cleaner spacing.
- `Soft Color`: light pastel accent colors while keeping readable lines.
- `Dark`: dark preview canvas with high-contrast nodes and edges.

Only beautified mode guarantees full style treatment. Standard mode may ignore style selection or use only minimal Mermaid theme changes.

## PNG Export

PNG export exports the complete chart content, not the current visible viewport.

Implementation approach:

1. Use the current successful SVG markup.
2. Clone or parse the SVG so export does not mutate the visible preview.
3. Ensure SVG has explicit width and height derived from its viewBox or bounding box.
4. Serialize SVG to a Blob URL or data URL.
5. Draw it into a canvas at `2x` scale.
6. Fill a white background before drawing unless the active style explicitly needs transparency. First version uses white background.
7. Convert canvas to PNG Blob.
8. Trigger download as `mermaid-diagram.png`.
9. Revoke temporary object URLs.

Export disabled states:

- No source.
- Loading.
- Render error.
- No successful SVG available.

## Zoom

Zoom affects preview display only.

- Default zoom: `100%`.
- Minimum: `50%`.
- Maximum: `200%`.
- Step: `10%`.
- Reset returns to `100%`.
- PNG export ignores zoom and always exports the complete chart at full content scale.

## Architecture

New and changed units:

1. Source normalization

   Existing Markdown extraction remains available. Add a helper that returns:

   - raw Mermaid source if no fenced block exists
   - first fenced Mermaid block if present
   - empty result when input is blank

2. Render configuration

   Extend Mermaid rendering to accept:

   - render mode
   - visual style

   The renderer should return SVG plus metadata needed for export.

3. Visual enhancement

   Enhancement should be mode-aware:

   - Standard mode: minimal class/attribute normalization.
   - Beautified mode: current full SVG enhancement.

4. PNG export

   Add a pure frontend export helper that accepts SVG markup and options:

   - filename
   - scale
   - background

   Return success or an error message for UI display.

5. UI controls

   Add small focused components or data structures for:

   - templates
   - render mode
   - style selector
   - zoom controls
   - export button

## Error Handling

- Mermaid render errors continue to show in the preview.
- Export errors show a concise message near the toolbar or preview state.
- Export must not silently download an empty or broken PNG.
- If SVG has no usable dimensions, export should fall back to viewBox dimensions; if both are missing, return an export error.

## Testing Plan

Unit tests:

- Source normalization raw Mermaid input.
- Source normalization fenced Mermaid input.
- Template data shape.
- PNG export helper dimension derivation, where practical with test doubles.
- Zoom clamp behavior.

Component tests:

- Render mode toggle changes preview mode.
- Style selector updates beautified preview class/state.
- Template selection replaces editor content.
- Export button is disabled for empty/error states.

Browser smoke tests:

- Raw Mermaid code renders a chart.
- Beautified mode renders enhanced SVG.
- Standard mode renders a chart without beautified-only class.
- PNG export triggers a download for a complete chart.
- Zoom controls change preview scale but do not break export.

## Deployment

The app remains deployed through the existing GitHub Pages workflow.

The final implementation must pass:

- `npm test`
- `npm run build`
- `npm run test:e2e`

After merge to `master`, the GitHub Pages deployment workflow should run normally.

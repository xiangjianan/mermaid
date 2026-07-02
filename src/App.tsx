import { useEffect, useMemo, useState } from "react";

import { EditorPane } from "./components/EditorPane";
import { PreviewPane, type PreviewState } from "./components/PreviewPane";
import { SplitPane } from "./components/SplitPane";
import { defaultMarkdown } from "./lib/defaultMarkdown";
import { useDebouncedValue } from "./lib/debounce";
import { renderMermaidDiagram } from "./lib/mermaidRenderer";
import { exportSvgToPng } from "./lib/pngExport";
import { normalizeMermaidSource } from "./lib/source";
import {
  clampZoom,
  DEFAULT_ZOOM,
  ZOOM_STEP,
  type RenderMode,
  type VisualStyle
} from "./lib/viewOptions";

export default function App() {
  const [source, setSource] = useState(defaultMarkdown);
  const [previewState, setPreviewState] = useState<PreviewState>({ type: "loading" });
  const [renderMode, setRenderMode] = useState<RenderMode>("beautified");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("product-saas");
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [exportMessage, setExportMessage] = useState("");
  const debouncedSource = useDebouncedValue(source, 250);
  const mermaidSource = useMemo(
    () => normalizeMermaidSource(debouncedSource),
    [debouncedSource]
  );

  useEffect(() => {
    let isStale = false;

    setExportMessage("");

    if (!mermaidSource.found || mermaidSource.code.trim().length === 0) {
      setPreviewState({ type: "empty" });
      return () => {
        isStale = true;
      };
    }

    setPreviewState({ type: "loading" });

    void renderMermaidDiagram(mermaidSource.code, {
      mode: renderMode,
      style: visualStyle
    }).then((result) => {
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
      await exportSvgToPng(previewState.svg);
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
            onZoomOut={() => {
              setZoom((currentZoom) => clampZoom(currentZoom - ZOOM_STEP));
            }}
            onZoomIn={() => {
              setZoom((currentZoom) => clampZoom(currentZoom + ZOOM_STEP));
            }}
            onZoomReset={() => {
              setZoom(DEFAULT_ZOOM);
            }}
            onExportPng={() => {
              void handleExportPng();
            }}
          />
        }
      />
    </main>
  );
}

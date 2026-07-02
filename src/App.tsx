import { useEffect, useMemo, useRef, useState } from "react";

import { EditorPane } from "./components/EditorPane";
import { PreviewPane, type PreviewState } from "./components/PreviewPane";
import { SplitPane } from "./components/SplitPane";
import { defaultMarkdown } from "./lib/defaultMarkdown";
import { useDebouncedValue } from "./lib/debounce";
import { renderMermaidDiagram } from "./lib/mermaidRenderer";
import { exportSvgToPng } from "./lib/pngExport";
import { normalizeMermaidSource } from "./lib/source";
import type { MermaidTemplate } from "./lib/templates";
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
  const [isExporting, setIsExporting] = useState(false);
  const isExportingRef = useRef(false);
  const exportMessageTokenRef = useRef(0);
  const debouncedSource = useDebouncedValue(source, 250);
  const mermaidSource = useMemo(
    () => normalizeMermaidSource(debouncedSource),
    [debouncedSource]
  );

  const handleSourceChange = (nextSource: string) => {
    exportMessageTokenRef.current += 1;
    setExportMessage("");
    setSource(nextSource);
  };

  const handleTemplateSelect = (template: MermaidTemplate) => {
    handleSourceChange(template.code);
    setZoom(DEFAULT_ZOOM);
  };

  useEffect(() => {
    let isStale = false;

    exportMessageTokenRef.current += 1;
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
    if (previewState.type !== "success" || isExportingRef.current) {
      return;
    }

    const exportToken = exportMessageTokenRef.current + 1;
    exportMessageTokenRef.current = exportToken;
    isExportingRef.current = true;
    setIsExporting(true);

    try {
      await exportSvgToPng(previewState.svg);
      if (exportMessageTokenRef.current === exportToken) {
        setExportMessage("PNG exported.");
      }
    } catch (error) {
      if (exportMessageTokenRef.current === exportToken) {
        setExportMessage(error instanceof Error ? error.message : String(error));
      }
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <main className="app-shell">
      <SplitPane
        storageKey="mermaid-visualizer-left-width"
        left={
          <EditorPane
            value={source}
            onChange={handleSourceChange}
            onTemplateSelect={handleTemplateSelect}
          />
        }
        right={
          <PreviewPane
            state={previewState}
            renderMode={renderMode}
            visualStyle={visualStyle}
            zoom={zoom}
            isExporting={isExporting}
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

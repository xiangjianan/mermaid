import { useEffect, useRef, useState } from "react";

import {
  renderModes,
  visualStyles,
  type RenderMode,
  type VisualStyle
} from "../lib/viewOptions";

export type PreviewState =
  | { type: "empty" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; svg: string };

type PreviewPaneProps = {
  state: PreviewState;
  renderMode: RenderMode;
  visualStyle: VisualStyle;
  zoom: number;
  exportMessage: string;
  onRenderModeChange: (mode: RenderMode) => void;
  onVisualStyleChange: (style: VisualStyle) => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onZoomReset: () => void;
  onExportPng: () => void;
};

export function PreviewPane({
  state,
  renderMode,
  visualStyle,
  zoom,
  exportMessage,
  onRenderModeChange,
  onVisualStyleChange,
  onZoomOut,
  onZoomIn,
  onZoomReset,
  onExportPng
}: PreviewPaneProps) {
  const paneRef = useRef<HTMLElement>(null);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  useEffect(() => {
    const syncNativeFullscreen = () => {
      const paneIsFullscreen = document.fullscreenElement === paneRef.current;
      setIsNativeFullscreen(paneIsFullscreen);

      if (document.fullscreenElement) {
        setIsFallbackFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", syncNativeFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", syncNativeFullscreen);
    };
  }, []);

  useEffect(() => {
    if (!isFallbackFullscreen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFallbackFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFallbackFullscreen]);

  const handleFullscreenClick = async () => {
    if (isNativeFullscreen) {
      await document.exitFullscreen();
      return;
    }

    if (isFallbackFullscreen) {
      setIsFallbackFullscreen(false);
      return;
    }

    const requestFullscreen = paneRef.current?.requestFullscreen;

    if (!requestFullscreen) {
      setIsFallbackFullscreen(true);
      return;
    }

    try {
      await requestFullscreen.call(paneRef.current);
    } catch {
      setIsFallbackFullscreen(true);
    }
  };

  const isFullscreen = isNativeFullscreen || isFallbackFullscreen;

  return (
    <section
      ref={paneRef}
      className={`tool-pane preview-pane${isFallbackFullscreen ? " preview-pane--fullscreen" : ""}`}
    >
      <header className="pane-header">
        <div>
          <h1>Visual Preview</h1>
          <p>Product SaaS rendering with a soft orthogonal diagram surface.</p>
        </div>
        <div className="preview-header-actions">
          <div className="preview-toolbar" aria-label="Preview controls">
            <div className="segmented-control" aria-label="Render mode">
              {renderModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={mode.id === renderMode ? "is-active" : ""}
                  aria-pressed={mode.id === renderMode}
                  onClick={() => {
                    onRenderModeChange(mode.id);
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <label className="toolbar-select-label">
              Style
              <select
                value={visualStyle}
                onChange={(event) => {
                  onVisualStyleChange(event.target.value as VisualStyle);
                }}
              >
                {visualStyles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="zoom-controls" aria-label="Zoom controls">
              <button type="button" aria-label="Zoom out" onClick={onZoomOut}>
                -
              </button>
              <button type="button" aria-label="Reset zoom" onClick={onZoomReset}>
                {zoom}%
              </button>
              <button type="button" aria-label="Zoom in" onClick={onZoomIn}>
                +
              </button>
            </div>
            <button
              type="button"
              className="toolbar-button"
              disabled={state.type !== "success"}
              onClick={onExportPng}
            >
              Export PNG
            </button>
          </div>
          <button
            type="button"
            className="fullscreen-button"
            aria-pressed={isFullscreen}
            onClick={() => {
              void handleFullscreenClick();
            }}
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          {exportMessage ? <p className="export-message">{exportMessage}</p> : null}
        </div>
      </header>
      <div className="preview-canvas" data-testid="preview-canvas">
        {state.type === "loading" ? (
          <div className="state-panel">Rendering diagram...</div>
        ) : null}
        {state.type === "empty" ? (
          <div className="state-panel">Add Mermaid source to preview a diagram.</div>
        ) : null}
        {state.type === "error" ? (
          <div className="state-panel error-panel">
            <strong>Mermaid render failed</strong>
            <pre>{state.message}</pre>
          </div>
        ) : null}
        {state.type === "success" ? (
          <div
            className="diagram-surface"
            aria-label="Rendered Mermaid diagram"
            style={{ transform: `scale(${zoom / 100})` }}
            dangerouslySetInnerHTML={{ __html: state.svg }}
          />
        ) : null}
      </div>
    </section>
  );
}

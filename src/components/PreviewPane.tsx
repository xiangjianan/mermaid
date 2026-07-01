import { useEffect, useRef, useState } from "react";

export type PreviewState =
  | { type: "empty" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; svg: string };

type PreviewPaneProps = {
  state: PreviewState;
};

export function PreviewPane({ state }: PreviewPaneProps) {
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
      </header>
      <div className="preview-canvas" data-testid="preview-canvas">
        {state.type === "loading" ? (
          <div className="state-panel">Rendering diagram...</div>
        ) : null}
        {state.type === "empty" ? (
          <div className="state-panel">Add a fenced mermaid code block to preview a diagram.</div>
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
            dangerouslySetInnerHTML={{ __html: state.svg }}
          />
        ) : null}
      </div>
    </section>
  );
}

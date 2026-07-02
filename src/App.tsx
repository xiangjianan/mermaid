import { useEffect, useMemo, useState } from "react";

import { EditorPane } from "./components/EditorPane";
import { PreviewPane, type PreviewState } from "./components/PreviewPane";
import { SplitPane } from "./components/SplitPane";
import { defaultMarkdown } from "./lib/defaultMarkdown";
import { useDebouncedValue } from "./lib/debounce";
import { renderMermaidDiagram } from "./lib/mermaidRenderer";
import { normalizeMermaidSource } from "./lib/source";

export default function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [previewState, setPreviewState] = useState<PreviewState>({ type: "loading" });
  const debouncedMarkdown = useDebouncedValue(markdown, 250);
  const mermaidBlock = useMemo(
    () => normalizeMermaidSource(debouncedMarkdown),
    [debouncedMarkdown]
  );

  useEffect(() => {
    let isStale = false;

    if (!mermaidBlock.found || mermaidBlock.code.trim().length === 0) {
      setPreviewState({ type: "empty" });
      return () => {
        isStale = true;
      };
    }

    setPreviewState({ type: "loading" });

    void renderMermaidDiagram(mermaidBlock.code).then((result) => {
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

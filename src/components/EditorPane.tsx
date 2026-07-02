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
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </section>
  );
}

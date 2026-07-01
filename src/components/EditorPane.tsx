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
          <p>Paste Markdown containing a fenced mermaid code block to render a polished diagram.</p>
        </div>
      </header>
      <textarea
        aria-label="Markdown input"
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

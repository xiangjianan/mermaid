import { mermaidTemplates, type MermaidTemplate } from "../lib/templates";

type EditorPaneProps = {
  value: string;
  onChange: (value: string) => void;
  onTemplateSelect: (template: MermaidTemplate) => void;
};

export function EditorPane({ value, onChange, onTemplateSelect }: EditorPaneProps) {
  return (
    <section className="tool-pane editor-pane">
      <header className="pane-header">
        <div>
          <h1>Mermaid Code</h1>
          <p>Paste Mermaid code directly, or keep using a fenced mermaid Markdown block.</p>
        </div>
        <label className="toolbar-select-label">
          Template
          <select
            defaultValue=""
            aria-label="Mermaid template"
            onChange={(event) => {
              const template = mermaidTemplates.find(
                (item) => item.id === event.target.value
              );
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

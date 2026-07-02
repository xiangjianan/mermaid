export type MermaidTemplate = {
  id: string;
  label: string;
  code: string;
};

export const mermaidTemplates: MermaidTemplate[] = [
  {
    id: "flowchart",
    label: "Flowchart",
    code: `flowchart TD
  A[Paste Mermaid] --> B{Choose Template}
  B -- Edit --> C[Update Source]
  B -- Preview --> D[Render Diagram]
  C --> D`
  },
  {
    id: "sequence",
    label: "Sequence Diagram",
    code: `sequenceDiagram
  participant User
  participant App
  User->>App: Open editor
  App-->>User: Render preview`
  },
  {
    id: "class",
    label: "Class Diagram",
    code: `classDiagram
  class Diagram {
    +String source
    +render()
  }
  Diagram <|-- MermaidDiagram`
  },
  {
    id: "state",
    label: "State Diagram",
    code: `stateDiagram-v2
  [*] --> Editing
  Editing --> Previewing: render
  Previewing --> Editing: update
  Previewing --> [*]`
  }
];

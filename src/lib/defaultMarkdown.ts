export const defaultMarkdown = `# Product Flow

\`\`\`mermaid
flowchart LR
  A[Paste Markdown] --> B{Find Mermaid}
  B -- Found --> C[Parse Flowchart]
  B -- Missing --> D[Show Empty State]
  C --> E[Render SVG]
  E --> F[Polish Lines]
  F --> G[Visual Preview]
\`\`\`
`;

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mermaidTemplates } from "../lib/templates";
import { EditorPane } from "./EditorPane";

describe("EditorPane", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("calls template select handler and resets the template select", () => {
    const onTemplateSelect = vi.fn();

    render(
      <EditorPane value="flowchart TD" onChange={vi.fn()} onTemplateSelect={onTemplateSelect} />
    );

    const select = screen.getByRole("combobox", { name: "Mermaid template" });

    fireEvent.change(select, { target: { value: "sequence" } });

    expect(onTemplateSelect).toHaveBeenCalledWith(mermaidTemplates[1]);
    expect(select).toHaveValue("");
  });
});

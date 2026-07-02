import "@testing-library/jest-dom/vitest";

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { exportSvgToPng } from "./lib/pngExport";
import { mermaidTemplates } from "./lib/templates";

vi.mock("./lib/mermaidRenderer", () => ({
  renderMermaidDiagram: vi.fn().mockResolvedValue({
    status: "success",
    svg: '<svg width="100" height="100" viewBox="0 0 100 100"></svg>'
  })
}));

vi.mock("./lib/pngExport", () => ({
  exportSvgToPng: vi.fn()
}));

describe("App", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not show a stale export message when source changes before export completes", async () => {
    let resolveExport: () => void = () => {};
    vi.mocked(exportSvgToPng).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveExport = resolve;
      })
    );

    render(<App />);

    const exportButton = await screen.findByRole("button", { name: "Export PNG" });

    await waitFor(() => {
      expect(exportButton).toBeEnabled();
    });

    fireEvent.click(exportButton);
    fireEvent.change(screen.getByLabelText("Mermaid code input"), {
      target: { value: "flowchart LR\n  A --> B\n  B --> C" }
    });

    await act(async () => {
      resolveExport();
    });

    expect(screen.queryByText("PNG exported.")).not.toBeInTheDocument();
  });

  it("does not show a stale export message when a template is selected before export completes", async () => {
    let resolveExport: () => void = () => {};
    vi.mocked(exportSvgToPng).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveExport = resolve;
      })
    );

    render(<App />);

    const exportButton = await screen.findByRole("button", { name: "Export PNG" });

    await waitFor(() => {
      expect(exportButton).toBeEnabled();
    });

    fireEvent.click(exportButton);
    fireEvent.change(screen.getByRole("combobox", { name: "Mermaid template" }), {
      target: { value: "sequence" }
    });

    await act(async () => {
      resolveExport();
    });

    expect(screen.queryByText("PNG exported.")).not.toBeInTheDocument();
  });

  it("replaces the editor source and resets zoom when selecting a template", async () => {
    render(<App />);

    const exportButton = await screen.findByRole("button", { name: "Export PNG" });

    await waitFor(() => {
      expect(exportButton).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByRole("button", { name: "Reset zoom" })).toHaveTextContent("110%");

    fireEvent.change(screen.getByRole("combobox", { name: "Mermaid template" }), {
      target: { value: "sequence" }
    });

    expect(screen.getByLabelText("Mermaid code input")).toHaveValue(mermaidTemplates[1].code);
    expect(screen.getByRole("button", { name: "Reset zoom" })).toHaveTextContent("100%");
  });
});

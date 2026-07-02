import "@testing-library/jest-dom/vitest";

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { exportSvgToPng } from "./lib/pngExport";

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
});

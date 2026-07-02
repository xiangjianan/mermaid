import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreviewPane } from "./PreviewPane";

const defaultPreviewPaneProps = {
  renderMode: "beautified" as const,
  visualStyle: "product-saas" as const,
  zoom: 100,
  isExporting: false,
  exportMessage: "",
  onRenderModeChange: vi.fn(),
  onVisualStyleChange: vi.fn(),
  onZoomOut: vi.fn(),
  onZoomIn: vi.fn(),
  onZoomReset: vi.fn(),
  onExportPng: vi.fn()
};

describe("PreviewPane", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("disables PNG export when preview is not successful", () => {
    const onExportPng = vi.fn();

    render(
      <PreviewPane
        {...defaultPreviewPaneProps}
        state={{ type: "empty" }}
        onExportPng={onExportPng}
      />
    );

    const exportButton = screen.getByRole("button", { name: "Export PNG" });

    expect(exportButton).toBeDisabled();

    fireEvent.click(exportButton);

    expect(onExportPng).not.toHaveBeenCalled();
  });

  it("calls PNG export when preview is successful and not exporting", () => {
    const onExportPng = vi.fn();

    render(
      <PreviewPane
        {...defaultPreviewPaneProps}
        state={{ type: "success", svg: "<svg viewBox=\"0 0 10 10\" />" }}
        onExportPng={onExportPng}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Export PNG" }));

    expect(onExportPng).toHaveBeenCalledTimes(1);
  });

  it("disables PNG export while exporting", () => {
    const onExportPng = vi.fn();

    render(
      <PreviewPane
        {...defaultPreviewPaneProps}
        state={{ type: "success", svg: "<svg viewBox=\"0 0 10 10\" />" }}
        isExporting={true}
        onExportPng={onExportPng}
      />
    );

    const exportButton = screen.getByRole("button", { name: "Export PNG" });

    expect(exportButton).toBeDisabled();

    fireEvent.click(exportButton);

    expect(onExportPng).not.toHaveBeenCalled();
  });

  it("calls render mode and zoom handlers", () => {
    const onRenderModeChange = vi.fn();
    const onZoomOut = vi.fn();
    const onZoomIn = vi.fn();
    const onZoomReset = vi.fn();

    render(
      <PreviewPane
        {...defaultPreviewPaneProps}
        state={{ type: "success", svg: "<svg viewBox=\"0 0 10 10\" />" }}
        renderMode="standard"
        zoom={120}
        onRenderModeChange={onRenderModeChange}
        onZoomOut={onZoomOut}
        onZoomIn={onZoomIn}
        onZoomReset={onZoomReset}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Beautified" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(screen.getByRole("button", { name: "Reset zoom" })).toHaveTextContent("120%");
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(onRenderModeChange).toHaveBeenCalledWith("beautified");
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onZoomReset).toHaveBeenCalledTimes(1);
    expect(onZoomIn).toHaveBeenCalledTimes(1);
  });

  it("calls visual style handler from the style select", () => {
    const onVisualStyleChange = vi.fn();

    render(
      <PreviewPane
        {...defaultPreviewPaneProps}
        state={{ type: "success", svg: "<svg viewBox=\"0 0 10 10\" />" }}
        onVisualStyleChange={onVisualStyleChange}
      />
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Style" }), {
      target: { value: "classic" }
    });

    expect(onVisualStyleChange).toHaveBeenCalledWith("classic");
  });

  it("renders export messages near the toolbar", () => {
    render(
      <PreviewPane
        {...defaultPreviewPaneProps}
        state={{ type: "success", svg: "<svg viewBox=\"0 0 10 10\" />" }}
        exportMessage="PNG exported."
      />
    );

    expect(screen.getByText("PNG exported.")).toBeInTheDocument();
  });

  it("applies zoom transform to successful diagrams", () => {
    render(
      <PreviewPane
        {...defaultPreviewPaneProps}
        state={{ type: "success", svg: "<svg viewBox=\"0 0 10 10\" />" }}
        zoom={150}
      />
    );

    expect(screen.getByLabelText("Rendered Mermaid diagram")).toHaveStyle({
      transform: "scale(1.5)"
    });
  });

  it("uses fallback fullscreen when native fullscreen is unavailable and exits on Escape", async () => {
    render(<PreviewPane {...defaultPreviewPaneProps} state={{ type: "empty" }} />);

    const button = screen.getByRole("button", { name: "Fullscreen" });
    fireEvent.click(button);

    expect(await screen.findByRole("button", { name: "Exit fullscreen" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.getByRole("button", { name: "Fullscreen" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});

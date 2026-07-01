import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SplitPane } from "./SplitPane";

describe("SplitPane", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
    document.body.classList.remove("is-resizing");
  });

  it("renders both panes", () => {
    render(
      <SplitPane
        left={<div>Markdown editor</div>}
        right={<div>Diagram preview</div>}
        storageKey="test-split"
      />
    );

    expect(screen.getByText("Markdown editor")).toBeInTheDocument();
    expect(screen.getByText("Diagram preview")).toBeInTheDocument();
  });

  it("persists split width after dragging", () => {
    render(
      <SplitPane
        left={<div>Markdown editor</div>}
        right={<div>Diagram preview</div>}
        storageKey="test-split"
      />
    );

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 0,
      width: 1000,
      height: 600,
      top: 0,
      right: 1100,
      bottom: 600,
      left: 100,
      toJSON: () => ({})
    });

    const divider = screen.getByRole("separator", { name: "Resize panes" });
    divider.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        pointerId: 1,
        clientX: 520,
        buttons: 1
      })
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerId: 1,
        clientX: 650,
        buttons: 1
      })
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        pointerId: 1,
        clientX: 650
      })
    );

    expect(localStorage.getItem("test-split")).toBe("55");
  });

  it("supports keyboard resizing with ARIA values", () => {
    render(
      <SplitPane
        left={<div>Markdown editor</div>}
        right={<div>Diagram preview</div>}
        storageKey="test-split"
      />
    );

    const divider = screen.getByRole("separator", { name: "Resize panes" });

    expect(divider).toHaveAttribute("aria-valuemin", "28");
    expect(divider).toHaveAttribute("aria-valuemax", "68");
    expect(divider).toHaveAttribute("aria-valuenow", "42");

    fireEvent.keyDown(divider, { key: "ArrowRight" });

    expect(divider).toHaveAttribute("aria-valuenow", "44");
    expect(localStorage.getItem("test-split")).toBe("44");

    fireEvent.keyDown(divider, { key: "ArrowLeft" });

    expect(divider).toHaveAttribute("aria-valuenow", "42");
    expect(localStorage.getItem("test-split")).toBe("42");
  });
});

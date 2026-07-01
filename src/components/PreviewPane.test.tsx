import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PreviewPane } from "./PreviewPane";

describe("PreviewPane", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("uses fallback fullscreen when native fullscreen is unavailable and exits on Escape", async () => {
    render(<PreviewPane state={{ type: "empty" }} />);

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

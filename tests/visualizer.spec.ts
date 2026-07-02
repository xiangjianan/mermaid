import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("renders raw Mermaid code in beautified mode", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByRole("textbox", { name: "Mermaid code input" });
  await expect(editor).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visual Preview" })).toBeVisible();

  await editor.fill("flowchart LR\n  RawA[Raw source] --> RawB[Rendered]");

  await expect(page.locator(".diagram-surface svg.visualizer-svg")).toBeVisible({
    timeout: 10_000,
  });
});

test("switches to standard mode", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Standard" }).click();

  await expect(page.locator(".diagram-surface svg.visualizer-mode-standard")).toBeVisible({
    timeout: 10_000,
  });
});

test("shows empty state when no Mermaid source exists", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Mermaid code input" }).fill("");

  await expect(page.getByText("Add Mermaid source to preview a diagram.")).toBeVisible();
});

test("shows error state for invalid Mermaid syntax", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Mermaid code input" }).fill(`flowchart LR
A -->`);

  await expect(page.getByText("Mermaid render failed")).toBeVisible({ timeout: 10_000 });
});

test("zooms preview and exports PNG", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".diagram-surface")).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByRole("button", { name: "Reset zoom" })).toContainText("110%");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("mermaid-diagram.png");

  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  if (downloadPath === null) {
    throw new Error("Expected downloaded PNG to be available on disk");
  }

  const png = await readFile(downloadPath);
  expect(png.length).toBeGreaterThan(8);
  expect(Array.from(png.subarray(0, 8))).toEqual([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
});

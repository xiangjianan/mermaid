import { expect, test as playwrightTest } from "@playwright/test";
import { test as vitestTest } from "vitest";

if (process.env.VITEST !== "true") {
  playwrightTest("renders the default mermaid diagram", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("textbox", { name: "Markdown input" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Visual Preview" })).toBeVisible();

    await expect(page.locator(".diagram-surface svg")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".diagram-surface svg path").first()).toHaveAttribute(
      "stroke-linecap",
      "round"
    );
  });

  playwrightTest("shows empty state when no mermaid block exists", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("textbox", { name: "Markdown input" }).fill("# Plain Markdown");

    await expect(page.getByText("Add a fenced")).toBeVisible();
  });

  playwrightTest("shows error state for invalid mermaid syntax", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("textbox", { name: "Markdown input" }).fill(`\`\`\`mermaid
flowchart LR
A -->
\`\`\``);

    await expect(page.getByText("Mermaid render failed")).toBeVisible({ timeout: 10_000 });
  });
} else {
  vitestTest.skip("browser smoke tests run with Playwright", () => {});
}

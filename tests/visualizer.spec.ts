import { expect, test } from "@playwright/test";

test("renders the default mermaid diagram", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Markdown input" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Visual Preview" })).toBeVisible();

  await expect(page.locator(".diagram-surface svg")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator(".diagram-surface svg path").first()).toHaveAttribute(
    "stroke-linecap",
    "round"
  );
});

test("shows empty state when source is blank", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Markdown input" }).fill("   ");

  await expect(page.getByText("Add a fenced")).toBeVisible();
});

test("shows error state for invalid mermaid syntax", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Markdown input" }).fill(`\`\`\`mermaid
flowchart LR
A -->
\`\`\``);

  await expect(page.getByText("Mermaid render failed")).toBeVisible({ timeout: 10_000 });
});

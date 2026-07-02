export type RenderMode = "standard" | "beautified";
export type VisualStyle = "product-saas" | "classic" | "soft-color" | "dark";

export const renderModes: Array<{ id: RenderMode; label: string }> = [
  { id: "standard", label: "Standard" },
  { id: "beautified", label: "Beautified" }
];

export const visualStyles: Array<{ id: VisualStyle; label: string }> = [
  { id: "product-saas", label: "Product SaaS" },
  { id: "classic", label: "Classic" },
  { id: "soft-color", label: "Soft Color" },
  { id: "dark", label: "Dark" }
];

export const MIN_ZOOM = 50;
export const MAX_ZOOM = 200;
export const DEFAULT_ZOOM = 100;
export const ZOOM_STEP = 10;

export function clampZoom(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_ZOOM;
  }

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value)));
}

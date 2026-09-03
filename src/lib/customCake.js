import {
  CAKE_SHAPES,
  CAKE_WEIGHTS,
} from "../data/customCake.js";

export function cakeWeightLabel({ weightId = "", customWeight = "" } = {}) {
  if (weightId === "custom") {
    const custom = String(customWeight || "").trim();
    return custom ? `${custom}` : "";
  }
  return CAKE_WEIGHTS.find((item) => item.id === weightId)?.label || "";
}

export function cakeShapeLabel(shapeId = "") {
  return CAKE_SHAPES.find((item) => item.id === shapeId)?.label || "";
}

export function customCakeBriefReady({
  weightId = "",
  customWeight = "",
  occasion = "",
  design = "",
} = {}) {
  const hasSize = Boolean(cakeWeightLabel({ weightId, customWeight }));
  const hasOccasion = Boolean(String(occasion || "").trim());
  const hasNotes = String(design || "").trim().length >= 6;
  return (hasSize && hasOccasion) || hasNotes;
}

export function formatCustomCakeBrief({
  weightId = "",
  customWeight = "",
  shapeId = "",
  occasion = "",
  sponge = "",
  flavour = "",
  design = "",
  cakeMessage = "",
  allergies = "",
} = {}) {
  const lines = [];
  const weight = cakeWeightLabel({ weightId, customWeight });
  const shape = cakeShapeLabel(shapeId);
  if (occasion) lines.push(`Occasion: ${occasion}`);
  if (weight) lines.push(`Weight: ${weight}`);
  if (shape) lines.push(`Shape: ${shape}`);
  if (sponge) lines.push(`Sponge: ${sponge}`);
  if (flavour) lines.push(`Flavour / filling: ${flavour}`);
  if (String(design || "").trim()) {
    lines.push("", "Design:", String(design).trim());
  }
  if (String(cakeMessage || "").trim()) {
    lines.push("", `Message on cake: ${String(cakeMessage).trim()}`);
  }
  if (String(allergies || "").trim()) {
    lines.push(
      "",
      `Allergies / special requests: ${String(allergies).trim()}`,
    );
  }
  if (lines.length) {
    lines.push(
      "",
      "Please quote on WhatsApp. I'll send reference photos in this chat.",
    );
  }
  return lines.join("\n");
}

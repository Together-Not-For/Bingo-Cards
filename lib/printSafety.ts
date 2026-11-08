import type { BingoCardCustomization } from "@/components/BingoCard";

export function escapePrintText(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export function safePrintCustomization(value: Partial<BingoCardCustomization>): BingoCardCustomization {
  const color = (input: unknown, fallback: string) =>
    typeof input === "string" && /^#[0-9a-f]{6}$/i.test(input) ? input : fallback;
  const number = (input: unknown, fallback: number, min: number, max: number) =>
    typeof input === "number" && Number.isFinite(input) && input >= min && input <= max ? input : fallback;
  return {
    cellBackgroundColor: color(value.cellBackgroundColor, "#ffffff"),
    cellTextColor: color(value.cellTextColor, "#24382c"),
    cellBorderColor: color(value.cellBorderColor, "#24382c"),
    freeCellBackgroundColor: color(value.freeCellBackgroundColor, "#ae5128"),
    freeCellTextColor: color(value.freeCellTextColor, "#fffbf5"),
    titleColor: color(value.titleColor, "#24382c"),
    footerColor: color(value.footerColor, "#24382c"),
    cardBackgroundColor: value.cardBackgroundColor === "transparent" ? "transparent" : color(value.cardBackgroundColor, "#ffffff"),
    cellFontSize: number(value.cellFontSize, 1, 0.5, 2),
    cellBorderSize: number(value.cellBorderSize, 3, 1, 8),
    alternateColors: value.alternateColors !== false,
    altCellBackgroundColor:
      value.altCellBackgroundColor === undefined
        ? undefined
        : color(value.altCellBackgroundColor, "#24382c"),
    altCellTextColor:
      value.altCellTextColor === undefined
        ? undefined
        : color(value.altCellTextColor, "#fffbf5"),
  };
}

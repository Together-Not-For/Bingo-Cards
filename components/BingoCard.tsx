"use client";

import { cn } from "@/lib/utils";

export interface BingoCardCustomization {
  cellBackgroundColor: string;
  cellTextColor: string;
  cellBorderColor: string;
  freeCellBackgroundColor: string;
  freeCellTextColor: string;
  titleColor: string;
  footerColor: string;
  cardBackgroundColor: string;
  cellFontSize: number; // Font size multiplier (0.5 to 2.0)
  cellBorderSize: number; // Border size in pixels (1 to 8)
  // Optional second tile color: every other square, like a patchwork quilt
  altCellBackgroundColor?: string;
  altCellTextColor?: string;
}

interface BingoCardProps {
  items: string[];
  title?: string;
  customization?: Partial<BingoCardCustomization>;
}

export function BingoCard({
  items,
  title = "2026 Bingo",
  customization,
}: BingoCardProps) {
  // Default customization values
  const defaults: BingoCardCustomization = {
    cellBackgroundColor: "#ffffff",
    cellTextColor: "#24382c",
    cellBorderColor: "#24382c",
    freeCellBackgroundColor: "#ae5128",
    freeCellTextColor: "#fffbf5",
    titleColor: "#24382c",
    footerColor: "#24382c",
    cardBackgroundColor: "#ffffff",
    cellFontSize: 1.0,
    cellBorderSize: 3,
  };

  const custom = { ...defaults, ...customization };

  // Text scales with the grid's own width (cqw), so cells stay readable at
  // phone widths instead of shrinking to a fixed rem size
  const getFontSize = (text: string) => {
    const baseSize = custom.cellFontSize || 1.0;
    const length = text.length;
    let widthPercent = 3.4;

    if (length <= 20) widthPercent = 3.4;
    else if (length <= 35) widthPercent = 2.8;
    else if (length <= 50) widthPercent = 2.6;
    else widthPercent = 2.3;

    // Keep the longest word inside the cell width
    const longestWord = Math.max(...text.split(/[\s/]+/).map((w) => w.length), 1);
    widthPercent = Math.max(Math.min(widthPercent, 30 / longestWord), 2.3);

    return `${(widthPercent * baseSize).toFixed(2)}cqw`;
  };

  return (
    <div
      className="print-card"
      style={{
        backgroundColor:
          custom.cardBackgroundColor === "transparent"
            ? "#ffffff"
            : custom.cardBackgroundColor,
      }}
    >
      <div className="mb-4 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: custom.titleColor,
          }}
        >
          {title}
        </h2>
      </div>
      <div
        className="grid grid-cols-5 gap-1 sm:gap-2 max-w-md mx-auto"
        style={{ containerType: "inline-size" }}
      >
        {items.map((item, index) => {
          const borderSize = custom.cellBorderSize || 3;
          const isFree = index === 12;
          // Checkerboard: odd squares use the second tile color, if there is one
          const isAlt =
            !isFree &&
            !!custom.altCellBackgroundColor &&
            (Math.floor(index / 5) + (index % 5)) % 2 === 1;
          const tileColor = isFree
            ? custom.freeCellBackgroundColor
            : isAlt
            ? custom.altCellBackgroundColor
            : custom.cellBackgroundColor;
          const textColor = isAlt
            ? custom.altCellTextColor ?? custom.cellTextColor
            : custom.cellTextColor;
          return (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-sm",
                "flex items-center justify-center text-center font-medium transition-all",
                "overflow-hidden",
                index === 12 ? "p-0" : "p-0.5 sm:p-2"
              )}
              style={{
                backgroundColor: tileColor,
                borderColor: custom.cellBorderColor,
                borderWidth: `${borderSize}px`,
                borderStyle: "solid",
              }}
            >
              {isFree ? (
                <span
                  className="font-bold w-full h-full flex flex-col items-center justify-center gap-[0.8cqw]"
                  style={{
                    color: custom.freeCellTextColor,
                    fontSize: "3.6cqw",
                    whiteSpace: "nowrap",
                    lineHeight: "1",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    style={{ width: "5cqw", height: "5cqw" }}
                    fill="currentColor"
                  >
                    <path d="M12 21.5C5.2 16 2.5 12.3 2.5 8.9 2.5 6.1 4.6 4 7.3 4c1.9 0 3.5 1 4.7 2.7C13.2 5 14.8 4 16.7 4c2.7 0 4.8 2.1 4.8 4.9 0 3.4-2.7 7.1-9.5 12.6Z" />
                  </svg>
                  {item}
                </span>
              ) : (
                <span
                  className={cn(
                    "w-full h-full flex items-center justify-center",
                    "px-0.5"
                  )}
                  style={{
                    color: textColor,
                    fontSize: getFontSize(item),
                    overflowWrap: "break-word",
                    hyphens: "auto",
                    lineHeight: "1.2",
                    textAlign: "center",
                  }}
                >
                  {item.replace(/\//g, "/\u200b")}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div
        className="mt-4 text-center text-xs sm:text-sm"
        style={{ color: custom.footerColor }}
      >
        <p>Made by Together, Not For</p>
      </div>
    </div>
  );
}

"use client";

import { BingoCard, BingoCardCustomization } from "@/components/BingoCard";
import Footer from "@/components/common/Footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { THEMED_ITEMS, THEME_LABELS, type Theme } from "@/lib/bingoItemsThemed";
import { cn } from "@/lib/utils";
import {
  Palette,
  Plus,
  Printer,
  Shuffle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

export default function Home() {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [bingoCard, setBingoCard] = useState<string[] | null>(null);
  const [customization, setCustomization] = useState<BingoCardCustomization>({
    cellBackgroundColor: "#ffffff",
    cellTextColor: "#111827",
    cellBorderColor: "#1f2937",
    freeCellBackgroundColor: "#fbbf24",
    freeCellTextColor: "#ffffff",
    titleColor: "#111827",
    footerColor: "#6b7280",
    cardBackgroundColor: "transparent",
    cellFontSize: 1.0,
    cellBorderSize: 3,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>(["basic"]);
  const previewRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const presets = {
    classic: {
      name: "Classic",
      colors: {
        cellBackgroundColor: "#ffffff",
        cellTextColor: "#111827",
        cellBorderColor: "#1f2937",
        freeCellBackgroundColor: "#fbbf24",
        freeCellTextColor: "#ffffff",
        titleColor: "#111827",
        footerColor: "#6b7280",
        cardBackgroundColor: "transparent",
        cellFontSize: 1.0,
        cellBorderSize: 3,
      },
    },
    dark: {
      name: "Dark Mode",
      colors: {
        cellBackgroundColor: "#1f2937",
        cellTextColor: "#f9fafb",
        cellBorderColor: "#4b5563",
        freeCellBackgroundColor: "#6366f1",
        freeCellTextColor: "#ffffff",
        titleColor: "#f9fafb",
        footerColor: "#9ca3af",
        cardBackgroundColor: "#111827",
        cellFontSize: 1.0,
        cellBorderSize: 3,
      },
    },
    pastel: {
      name: "Pastel",
      colors: {
        cellBackgroundColor: "#fef3c7",
        cellTextColor: "#78350f",
        cellBorderColor: "#fbbf24",
        freeCellBackgroundColor: "#c084fc",
        freeCellTextColor: "#ffffff",
        titleColor: "#7c3aed",
        footerColor: "#a78bfa",
        cardBackgroundColor: "#faf5ff",
        cellFontSize: 1.0,
        cellBorderSize: 3,
      },
    },
    bold: {
      name: "Bold",
      colors: {
        cellBackgroundColor: "#fee2e2",
        cellTextColor: "#7f1d1d",
        cellBorderColor: "#dc2626",
        freeCellBackgroundColor: "#dc2626",
        freeCellTextColor: "#ffffff",
        titleColor: "#991b1b",
        footerColor: "#b91c1c",
        cardBackgroundColor: "#fef2f2",
        cellFontSize: 1.0,
        cellBorderSize: 3,
      },
    },
    ocean: {
      name: "Ocean",
      colors: {
        cellBackgroundColor: "#e0f2fe",
        cellTextColor: "#0c4a6e",
        cellBorderColor: "#0284c7",
        freeCellBackgroundColor: "#0ea5e9",
        freeCellTextColor: "#ffffff",
        titleColor: "#0369a1",
        footerColor: "#38bdf8",
        cardBackgroundColor: "#f0f9ff",
        cellFontSize: 1.0,
        cellBorderSize: 3,
      },
    },
    forest: {
      name: "Forest",
      colors: {
        cellBackgroundColor: "#dcfce7",
        cellTextColor: "#14532d",
        cellBorderColor: "#16a34a",
        freeCellBackgroundColor: "#22c55e",
        freeCellTextColor: "#ffffff",
        titleColor: "#15803d",
        footerColor: "#4ade80",
        cardBackgroundColor: "#f0fdf4",
        cellFontSize: 1.0,
        cellBorderSize: 3,
      },
    },
  };

  const addItem = () => {
    if (items.length >= 24) {
      return; // Don't allow adding more than 24 items
    }
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      setItems([...items, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const autoFillItems = () => {
    const itemsNeeded = Math.max(0, 24 - items.length);
    if (itemsNeeded === 0) return;

    // Calculate items per theme (evenly distributed)
    const numThemes = selectedThemes.length;
    const itemsPerTheme = Math.floor(itemsNeeded / numThemes);
    const remainder = itemsNeeded % numThemes;

    // Collect items from each theme evenly
    const newItems: string[] = [];

    selectedThemes.forEach((theme, themeIndex) => {
      // Get items from this theme that aren't already in the list
      const themeItems = THEMED_ITEMS[theme].filter(
        (item) => !items.includes(item)
      );

      // Shuffle this theme's items
      const shuffled = [...themeItems].sort(() => Math.random() - 0.5);

      // Calculate how many to take from this theme
      // Distribute remainder items across first few themes
      const takeFromThisTheme =
        itemsPerTheme + (themeIndex < remainder ? 1 : 0);

      // Take the calculated amount
      newItems.push(...shuffled.slice(0, takeFromThisTheme));
    });

    // Shuffle the final combined list to mix themes together
    const finalShuffled = [...newItems].sort(() => Math.random() - 0.5);

    setItems([...items, ...finalShuffled]);
  };

  const generateBingoCard = () => {
    if (items.length !== 24) {
      alert(
        "Please add exactly 24 items to create a bingo card (5x5 grid with FREE space in center)"
      );
      return;
    }

    // Shuffle items (we already have exactly 24)
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const selected = shuffled;

    // Create 5x5 grid with FREE in center
    const grid: string[] = [];
    let itemIndex = 0;

    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        // Center square is FREE
        grid.push("FREE");
      } else {
        grid.push(selected[itemIndex++]);
      }
    }

    setBingoCard(grid);

    // Scroll to preview after a short delay to ensure it's rendered
    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const randomizeCard = () => {
    if (items.length !== 24) return;
    generateBingoCard();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && bingoCard) {
      // Calculate font size based on text length and user's font size multiplier
      const getFontSize = (text: string) => {
        const fontSizeMultiplier = customization.cellFontSize || 1.0;
        const length = text.length;
        let baseSize = 1.0; // Base size in rem

        if (length <= 20) baseSize = 1.0;
        else if (length <= 35) baseSize = 0.9;
        else if (length <= 50) baseSize = 0.85;
        else baseSize = 0.8;

        const adjustedSize = baseSize * fontSizeMultiplier;
        return `${adjustedSize}rem`;
      };

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>2026 Bingo Card</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 10mm;
                background: ${
                  customization.cardBackgroundColor === "transparent"
                    ? "white"
                    : customization.cardBackgroundColor
                };
              }
              .bingo-container {
                max-width: 600px;
                width: 100%;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .bingo-title {
                text-align: center;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 16px;
                color: ${customization.titleColor};
                letter-spacing: 0.15em;
                font-family: Georgia, "Times New Roman", serif;
              }
              .bingo-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                grid-template-rows: repeat(5, 1fr);
                gap: 8px;
                margin-bottom: 16px;
                width: 100%;
              }
              .bingo-cell {
                width: 100%;
                height: 0;
                padding-bottom: 100%;
                position: relative;
                border: ${customization.cellBorderSize || 3}px solid ${
        customization.cellBorderColor
      };
                border-radius: 8px;
                background: ${customization.cellBackgroundColor} !important;
                color: ${customization.cellTextColor} !important;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .bingo-cell > span {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px;
                text-align: center;
                font-weight: 500;
                overflow: hidden;
                line-height: 1.3;
                word-break: normal;
                overflow-wrap: normal;
                hyphens: none;
              }
              .bingo-cell.free {
                background: ${customization.freeCellBackgroundColor} !important;
              }
              .bingo-cell.free > span {
                color: ${customization.freeCellTextColor} !important;
                font-size: 2rem;
                font-weight: bold;
                padding: 0;
                white-space: nowrap;
                overflow: visible;
                text-overflow: clip;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .bingo-footer {
                text-align: center;
                color: ${customization.footerColor};
                font-size: 0.875rem;
                margin-top: 16px;
              }
              @media print {
                @page {
                  size: letter;
                  margin: 15mm;
                }
                body {
                  padding: 0;
                  margin: 0;
                  min-height: auto;
                }
                .bingo-container {
                  margin: 0 auto;
                  max-width: 100%;
                }
                .bingo-grid {
                  gap: 8px;
                }
                .bingo-cell {
                  border-width: ${customization.cellBorderSize || 3}px;
                }
                .bingo-cell > span {
                  padding: 12px;
                }
                .bingo-cell.free > span {
                  font-size: 3rem;
                  white-space: nowrap;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="bingo-container">
              <h1 class="bingo-title">2026 BINGO</h1>
              <div class="bingo-grid">
                ${bingoCard
                  .map(
                    (item, index) =>
                      `<div class="bingo-cell ${
                        index === 12 ? "free" : ""
                      }"><span style="${
                        index !== 12
                          ? `font-size: ${getFontSize(item)}; color: ${
                              customization.cellTextColor
                            };`
                          : ""
                      }">${item}</span></div>`
                  )
                  .join("")}
              </div>
              <div class="bingo-footer">Generated by Together, Not For</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 250);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Landing Page Hero Section */}
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="text-center mb-6">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
            🎯 2026 Edition
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            2026 Bingo Card Generator
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            Create custom, printable bingo cards for 2026. Add your items,
            generate your card, and start playing!
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm">
              ✨ Custom Items
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm">
              🎲 Randomize
            </span>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm">
              🖨️ Print Ready
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Item Management Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Manage Your Items</CardTitle>
              <CardDescription>
                Add exactly 24 items to create your bingo card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter an item..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  className="flex-1"
                  disabled={items.length >= 24}
                />
                <Button
                  onClick={addItem}
                  size="icon"
                  disabled={items.length >= 24}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No items yet. Add some items to get started!
                  </p>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-sm font-medium">{item}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Items:{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        items.length === 24
                          ? "text-green-600"
                          : "text-orange-600"
                      )}
                    >
                      {items.length} / 24
                    </span>
                  </p>
                  {items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setItems([])}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
                {items.length < 24 && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                          Choose theme(s) for auto-fill:
                        </label>
                        {selectedThemes.length <
                          (Object.keys(THEME_LABELS) as Theme[]).length && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedThemes(
                                Object.keys(THEME_LABELS) as Theme[]
                              )
                            }
                            className="text-xs h-auto py-1 px-2"
                          >
                            Select All
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(THEME_LABELS) as Theme[]).map((theme) => {
                          const isSelected = selectedThemes.includes(theme);
                          return (
                            <Button
                              key={theme}
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => {
                                if (isSelected) {
                                  // Deselect if already selected (but keep at least one)
                                  if (selectedThemes.length > 1) {
                                    setSelectedThemes(
                                      selectedThemes.filter((t) => t !== theme)
                                    );
                                  }
                                } else {
                                  // Add to selection
                                  setSelectedThemes([...selectedThemes, theme]);
                                }
                              }}
                              className="h-auto py-2 px-3 text-xs capitalize"
                              size="sm"
                            >
                              {isSelected && "✓ "}
                              {THEME_LABELS[theme]}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      onClick={autoFillItems}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Auto-fill {24 - items.length} item
                      {24 - items.length === 1 ? "" : "s"} from{" "}
                      {selectedThemes.length === 1
                        ? THEME_LABELS[selectedThemes[0]].toLowerCase()
                        : `${selectedThemes.length} themes`}
                    </Button>
                  </div>
                )}
                {items.length >= 24 && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center mb-4">
                    ✓ You have exactly 24 items!
                  </p>
                )}
                <Button
                  onClick={generateBingoCard}
                  disabled={items.length !== 24}
                  className={cn(
                    "w-full text-lg font-bold shadow-lg transition-all",
                    items.length === 24
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14"
                      : "h-12"
                  )}
                  size="lg"
                >
                  {items.length < 24
                    ? `Add ${24 - items.length} more item${
                        24 - items.length === 1 ? "" : "s"
                      } to generate`
                    : items.length > 24
                    ? `Remove ${items.length - 24} item${
                        items.length - 24 === 1 ? "" : "s"
                      } to generate`
                    : "🎯 Generate Bingo Card"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview and Customization Cards Container */}
          {bingoCard && (
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Preview Card */}
              <Card className="shadow-lg flex-1" ref={previewRef}>
                <CardHeader>
                  <CardTitle className="text-2xl">Preview & Actions</CardTitle>
                  <CardDescription>
                    Preview your bingo card and customize it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-inner w-full overflow-auto">
                    <div
                      ref={cardRef}
                      className="min-w-[280px] max-w-full mx-auto"
                    >
                      <BingoCard
                        items={bingoCard}
                        customization={customization}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={randomizeCard}
                      variant="outline"
                      className="flex-1"
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Randomize
                    </Button>
                    <Button
                      onClick={handlePrint}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Card
                    </Button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                    <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-1">
                      📸 To Save as Image:
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Take a screenshot of the bingo card above using your
                      system&rsquo;s screenshot tool (e.g., Cmd+Shift+4 on Mac,
                      Windows+Shift+S on Windows, or use your browser&rsquo;s
                      developer tools).
                    </p>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Click &ldquo;Randomize&rdquo; to shuffle the items, or
                    &ldquo;Print Card&rdquo; to print
                  </p>
                </CardContent>
              </Card>

              {/* Customization Card */}
              <Card className="shadow-lg lg:flex-1 lg:max-w-md">
                <CardHeader className="lg:pb-3">
                  <CardTitle className="text-xl lg:text-2xl">
                    Customize Your Card
                  </CardTitle>
                  <CardDescription className="text-sm lg:text-base">
                    Change colors and styling to match your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 lg:space-y-4">
                  {/* Presets */}
                  <div>
                    <label className="text-xs lg:text-sm font-medium mb-1.5 lg:mb-2 block">
                      Color Presets
                    </label>
                    <div className="grid grid-cols-3 lg:grid-cols-3 gap-1.5 lg:gap-2">
                      {Object.entries(presets).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant="outline"
                          onClick={() => {
                            setCustomization(preset.colors);
                          }}
                          className="h-auto py-2 lg:py-3 flex flex-col items-center gap-0.5 lg:gap-1"
                        >
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  preset.colors.cellBackgroundColor,
                                border: `1px solid ${preset.colors.cellBorderColor}`,
                              }}
                            />
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  preset.colors.freeCellBackgroundColor,
                              }}
                            />
                          </div>
                          <span className="text-xs">{preset.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size and Border Size Controls */}
                  <div className="space-y-3 lg:space-y-4 pt-2 border-t">
                    <div className="space-y-1.5 lg:space-y-2">
                      <label className="text-xs lg:text-sm font-medium">
                        Font Size: {customization.cellFontSize.toFixed(1)}x
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={customization.cellFontSize}
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              cellFontSize: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs lg:text-sm text-muted-foreground min-w-[3rem] text-right">
                          {customization.cellFontSize.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 lg:space-y-2">
                      <label className="text-xs lg:text-sm font-medium">
                        Border Size: {customization.cellBorderSize}px
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="8"
                          step="1"
                          value={customization.cellBorderSize}
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              cellBorderSize: parseInt(e.target.value),
                            })
                          }
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs lg:text-sm text-muted-foreground min-w-[3rem] text-right">
                          {customization.cellBorderSize}px
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <Palette className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground" />
                      <label className="text-xs lg:text-sm font-medium">
                        Advanced Color Options
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        showAdvanced ? "bg-blue-600" : "bg-gray-200"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          showAdvanced ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>

                  {/* Advanced Color Options */}
                  {showAdvanced && (
                    <>
                      <div className="grid grid-cols-2 gap-2 lg:gap-4 pt-3 lg:pt-4 border-t">
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            Cell Background
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={customization.cellBackgroundColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cellBackgroundColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.cellBackgroundColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cellBackgroundColor: e.target.value,
                                })
                              }
                              className="flex-1"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            Cell Text
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={customization.cellTextColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cellTextColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.cellTextColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cellTextColor: e.target.value,
                                })
                              }
                              className="flex-1"
                              placeholder="#111827"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            Cell Border
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={customization.cellBorderColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cellBorderColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.cellBorderColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cellBorderColor: e.target.value,
                                })
                              }
                              className="flex-1"
                              placeholder="#1f2937"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            FREE Background
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={customization.freeCellBackgroundColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  freeCellBackgroundColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.freeCellBackgroundColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  freeCellBackgroundColor: e.target.value,
                                })
                              }
                              className="flex-1"
                              placeholder="#fbbf24"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            FREE Text
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={customization.freeCellTextColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  freeCellTextColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.freeCellTextColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  freeCellTextColor: e.target.value,
                                })
                              }
                              className="flex-1"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            Title Color
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={customization.titleColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  titleColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.titleColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  titleColor: e.target.value,
                                })
                              }
                              className="flex-1"
                              placeholder="#111827"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            Footer Color
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={customization.footerColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  footerColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.footerColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  footerColor: e.target.value,
                                })
                              }
                              className="flex-1"
                              placeholder="#6b7280"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 lg:space-y-2">
                          <label className="text-xs lg:text-sm font-medium">
                            Card Background
                          </label>
                          <div className="flex gap-1.5 lg:gap-2">
                            <input
                              type="color"
                              value={
                                customization.cardBackgroundColor ===
                                "transparent"
                                  ? "#ffffff"
                                  : customization.cardBackgroundColor
                              }
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cardBackgroundColor: e.target.value,
                                })
                              }
                              className="h-8 w-16 lg:h-10 lg:w-20 rounded border border-gray-300 cursor-pointer"
                            />
                            <Input
                              value={customization.cardBackgroundColor}
                              onChange={(e) =>
                                setCustomization({
                                  ...customization,
                                  cardBackgroundColor:
                                    e.target.value || "transparent",
                                })
                              }
                              className="flex-1"
                              placeholder="transparent"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCustomization(presets.classic.colors);
                          setShowAdvanced(false);
                        }}
                        className="w-full mt-4"
                      >
                        Reset to Classic
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer textColor="#6b7280" iconColor="#bf8104" />
    </div>
  );
}

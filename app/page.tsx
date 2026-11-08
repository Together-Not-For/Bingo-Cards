"use client";

import { BingoCard, BingoCardCustomization } from "@/components/BingoCard";
import { BingoPoolSignup } from "@/components/BingoPoolSignup";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  trackCardGenerated,
  trackCardLoaded,
  trackCardPrinted,
  trackCardSaved,
  trackThemeSelected,
} from "@/lib/analytics";
import {
  SELECTABLE_THEMES,
  THEMED_ITEMS,
  THEME_LABELS,
  type Theme,
} from "@/lib/bingoItemsThemed";
import { cn } from "@/lib/utils";
import { cleanFirstName } from "@/lib/cardTitle";
import { escapePrintText, safePrintCustomization } from "@/lib/printSafety";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Info,
  Palette,
  Pencil,
  Plus,
  Printer,
  Search,
  Share2,
  Shuffle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

type BingoItem = {
  text: string;
  isAutoFilled: boolean;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<BingoItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [bingoCard, setBingoCard] = useState<string[] | null>(null);
  const [customization, setCustomization] = useState<BingoCardCustomization>({
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
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>(["basic"]);
  const [spicyLevel, setSpicyLevel] = useState<1 | 2 | 3>(1);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [pendingSpicySelection, setPendingSpicySelection] = useState(false);
  const [wasSelectingAll, setWasSelectingAll] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // New state for save/share functionality
  const [savedCardCode, setSavedCardCode] = useState<string | null>(null);
  const [savingCard, setSavingCard] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [showStyleInfo, setShowStyleInfo] = useState(false);
  const [duplicateNotice, setDuplicateNotice] = useState("");
  const styleDetailsRef = useRef<HTMLDetailsElement>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadCodeInput, setLoadCodeInput] = useState("");
  const [loadingCard, setLoadingCard] = useState(false);

  // Check localStorage for age verification on mount
  useEffect(() => {
    const verified = localStorage.getItem("spicy_age_verified");
    if (verified === "true") {
      setIsAgeVerified(true);
    }
  }, []);

  // Load card from URL params (for "Edit as New" flow)
  useEffect(() => {
    const loadCard = searchParams?.get("loadCard");
    const itemsParam = searchParams?.get("items");
    const customizationParam = searchParams?.get("customization");

    if (loadCard === "true" && itemsParam) {
      try {
        const loadedItems: string[] = JSON.parse(
          decodeURIComponent(itemsParam)
        );
        const loadedCustomization = customizationParam
          ? JSON.parse(decodeURIComponent(customizationParam))
          : {};

        // Convert loaded items to BingoItem format (all marked as not auto-filled since they're from a saved card)
        const bingoItems: BingoItem[] = loadedItems
          .filter((item) => item !== "FREE")
          .map((text) => ({
            text,
            isAutoFilled: false,
          }));

        setItems(bingoItems);
        setBingoCard(loadedItems);
        // Handle null customization - if parsed value is null, use empty object
        const { firstName: loadedName, ...loadedStyle } =
          loadedCustomization && typeof loadedCustomization === "object"
            ? loadedCustomization
            : ({} as Record<string, unknown>);
        setFirstName(cleanFirstName(loadedName));
        setCustomization((c) => ({ ...c, ...loadedStyle }));

        // Track card load from URL
        trackCardLoaded("url");

        // Scroll to preview
        setTimeout(() => {
          previewRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } catch (error) {
        console.error("Error loading card from URL:", error);
      }
    }
  }, [searchParams]);

  // Helper function to convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Helper function to calculate relative luminance
  const getLuminance = (hex: string): number => {
    const rgb =
      hex.match(/[A-Za-z0-9]{2}/g)?.map((v) => parseInt(v, 16) / 255) || [];
    const [r, g, b] = rgb.map((val) => {
      return val <= 0.03928
        ? val / 12.92
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Helper function to calculate contrast ratio
  const getContrastRatio = (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Function to generate random preset colors with proper contrast
  const generateRandomPreset = () => {
    // Pick a random base hue (0-360)
    const baseHue = Math.floor(Math.random() * 360);

    // Generate a cohesive color scheme using the same hue family
    // Cell background: light tint (high lightness, low saturation)
    const cellBg = hslToRgb(
      baseHue,
      20 + Math.random() * 30,
      85 + Math.random() * 10
    );

    // Cell text: dark version of same hue for good contrast
    let cellText = hslToRgb(
      baseHue,
      60 + Math.random() * 30,
      15 + Math.random() * 10
    );

    // Ensure minimum contrast ratio of 4.5:1 (WCAG AA standard)
    let contrast = getContrastRatio(cellBg, cellText);
    if (contrast < 4.5) {
      // Adjust text to be darker if contrast is too low
      cellText = hslToRgb(baseHue, 70, 10);
    }

    // Cell border: medium saturation, medium lightness
    const cellBorder = hslToRgb(
      baseHue,
      50 + Math.random() * 30,
      40 + Math.random() * 20
    );

    // Free cell background: complementary or analogous hue, vibrant
    const freeHue = (baseHue + 180 + (Math.random() * 60 - 30)) % 360; // Complementary with variation
    const freeBg = hslToRgb(
      freeHue,
      70 + Math.random() * 25,
      45 + Math.random() * 15
    );

    // Free cell text: white or very light for contrast
    let freeText = "#ffffff";
    if (getContrastRatio(freeBg, freeText) < 4.5) {
      // If background is too light, use dark text
      const freeTextDark = hslToRgb(freeHue, 70, 20);
      if (
        getContrastRatio(freeBg, freeTextDark) >
        getContrastRatio(freeBg, freeText)
      ) {
        freeText = freeTextDark;
      }
    }

    // Title: darker version of base hue
    const title = hslToRgb(
      baseHue,
      60 + Math.random() * 30,
      25 + Math.random() * 15
    );

    // Footer: muted version of base hue
    const footer = hslToRgb(
      baseHue,
      30 + Math.random() * 20,
      50 + Math.random() * 20
    );

    // Card background: very light tint or transparent
    const cardBg =
      Math.random() > 0.5
        ? "transparent"
        : hslToRgb(baseHue, 10 + Math.random() * 10, 95 + Math.random() * 5);

    return {
      cellBackgroundColor: cellBg,
      cellTextColor: cellText,
      cellBorderColor: cellBorder,
      freeCellBackgroundColor: freeBg,
      freeCellTextColor: freeText,
      titleColor: title,
      footerColor: footer,
      cardBackgroundColor: cardBg,
      cellFontSize: 1.0,
      cellBorderSize: 3,
    };
  };

  const presets = {
    classic: {
      name: "Classic",
      colors: {
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
    random: {
      name: "Random",
      colors: {
        // Placeholder colors for display - will be regenerated on click
        cellBackgroundColor: "#ff6b6b",
        cellTextColor: "#333333",
        cellBorderColor: "#4ecdc4",
        freeCellBackgroundColor: "#45b7d1",
        freeCellTextColor: "#ffffff",
        titleColor: "#96ceb4",
        footerColor: "#ffeaa7",
        cardBackgroundColor: "#dfe6e9",
        cellFontSize: 1.0,
        cellBorderSize: 3,
      },
    },
  };

  const MAX_ITEM_LENGTH = 60;

  const addItem = () => {
    if (items.length >= 24) {
      return; // Don't allow adding more than 24 items
    }
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    if (items.some((item) => item.text === trimmedValue)) {
      setDuplicateNotice("That one is already on your card");
      return;
    }
    setItems([...items, { text: trimmedValue, isAutoFilled: false }]);
    setInputValue("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const editItem = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index].text);
  };

  const updateItem = (index: number) => {
    const trimmedValue = editValue.trim();
    if (
      trimmedValue &&
      !items.some((item, i) => i !== index && item.text === trimmedValue)
    ) {
      const updatedItems = [...items];
      updatedItems[index] = { ...updatedItems[index], text: trimmedValue };
      setItems(updatedItems);
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
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
      const existingTexts = items.map((item) => item.text);

      // Handle spicy theme - use the selected level
      let themeItems: string[];
      if (theme === "spicy") {
        const spicyThemeKey =
          spicyLevel === 1 ? "spicy" : spicyLevel === 2 ? "spicy2" : "spicy3";
        themeItems = THEMED_ITEMS[spicyThemeKey as Theme].filter(
          (item) => !existingTexts.includes(item)
        );
      } else {
        themeItems = THEMED_ITEMS[theme].filter(
          (item) => !existingTexts.includes(item)
        );
      }

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

    // Convert to BingoItem format with isAutoFilled: true
    const autoFilledItems: BingoItem[] = finalShuffled.map((text) => ({
      text,
      isAutoFilled: true,
    }));

    setItems([...items, ...autoFilledItems]);
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
        grid.push(selected[itemIndex++].text);
      }
    }

    setBingoCard(grid);

    // Track card generation
    trackCardGenerated();

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

  const handleSaveCard = async () => {
    if (!bingoCard) return;

    setSavingCard(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: bingoCard,
          customization,
          firstName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save card");
      }

      const data = await response.json();
      setSavedCardCode(data.code);
      setShowShareDialog(true);

      // Track card save
      trackCardSaved(data.code);
    } catch (error) {
      console.error("Error saving card:", error);
      alert("Failed to save card. Please try again.");
    } finally {
      setSavingCard(false);
    }
  };

  const handleCopyLink = () => {
    if (!savedCardCode) return;

    const link = `${window.location.origin}/card/${savedCardCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleLoadCard = async () => {
    if (!loadCodeInput.trim()) return;

    setLoadingCard(true);
    try {
      const response = await fetch(`/api/cards/${loadCodeInput.trim()}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert("Card not found. Please check the code and try again.");
        } else {
          throw new Error("Failed to load card");
        }
        setLoadingCard(false);
        return;
      }

      const data = await response.json();

      // Load the card data
      const loadedItems: BingoItem[] = data.items
        .filter((item: string) => item !== "FREE")
        .map((text: string) => ({
          text,
          isAutoFilled: false,
        }));

      setItems(loadedItems);
      setBingoCard(data.items);
      // Handle null customization - if data.customization is null or not an object, use empty object
      const { firstName: loadedName, ...loadedStyle } =
        data.customization && typeof data.customization === "object"
          ? data.customization
          : ({} as Record<string, unknown>);
      setFirstName(cleanFirstName(loadedName));
      setCustomization({ ...customization, ...loadedStyle });
      setLoadCodeInput("");

      // Track card load
      trackCardLoaded("code", loadCodeInput.trim());

      // Scroll to preview
      setTimeout(() => {
        previewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Error loading card:", error);
      alert("Failed to load card. Please try again.");
    } finally {
      setLoadingCard(false);
    }
  };

  const handlePrint = () => {
    // Track print event
    trackCardPrinted(savedCardCode || undefined);

    const printWindow = window.open("", "_blank");
    if (printWindow && bingoCard) {
      const printCustomization = safePrintCustomization(customization);
      // Calculate font size based on text length and user's font size multiplier
      const getFontSize = (text: string) => {
        const fontSizeMultiplier = printCustomization.cellFontSize || 1.0;
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
                  printCustomization.cardBackgroundColor === "transparent"
                    ? "white"
                    : printCustomization.cardBackgroundColor
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
                color: ${printCustomization.titleColor};
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
                border: ${printCustomization.cellBorderSize || 3}px solid ${
        printCustomization.cellBorderColor
      };
                border-radius: 8px;
                background: ${printCustomization.cellBackgroundColor} !important;
                color: ${printCustomization.cellTextColor} !important;
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
                overflow-wrap: break-word;
                hyphens: auto;
              }
              .bingo-cell.free {
                background: ${printCustomization.freeCellBackgroundColor} !important;
              }
              .bingo-cell.free > span {
                color: ${printCustomization.freeCellTextColor} !important;
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
                color: ${printCustomization.footerColor};
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
                  border-width: ${printCustomization.cellBorderSize || 3}px;
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
                              printCustomization.cellTextColor
                            };`
                          : ""
                      }">${escapePrintText(item).replace(/\//g, "/&#8203;")}</span></div>`
                  )
                  .join("")}
              </div>
              <div class="bingo-footer">Generated by Together, Not For</div>
            </div>
            <script>
              function fitCells() {
                document.querySelectorAll(".bingo-cell > span").forEach(function(cell) {
                  var size = parseFloat(getComputedStyle(cell).fontSize);
                  while (cell.scrollHeight > cell.clientHeight && size > 5) {
                    size -= 0.5;
                    cell.style.fontSize = size + "px";
                  }
                });
              }
              window.onload = function() {
                fitCells();
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6">
        <header className="flex justify-end">
          <ThemeToggle />
        </header>

        <section className="mx-auto mt-5 max-w-2xl sm:mt-8">
          <h1 className="text-4xl font-bold leading-tight text-primary sm:text-6xl">
            Let&apos;s make your 2026 bingo card
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Pick 24 things you want to do this year. Print it, or send it to the
            group chat
          </p>
        </section>

        <details className="group mx-auto mt-4 max-w-2xl">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-xl font-bold text-primary [&::-webkit-details-marker]:hidden">
            How it works
            <ChevronDown className="h-6 w-6 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-lg">
            Pick 24 things you want to do this year, or let us fill in some.
            Make your card, then print it or save it and send the link to the
            group chat. Cross off squares as the year goes
          </p>
        </details>

        <div className="mt-6 space-y-10">
          <section className="mx-auto max-w-2xl" aria-labelledby="goals-heading">
            <h2 id="goals-heading" className="text-2xl font-bold text-primary">
              Your 24 things
            </h2>
            <div className="mt-5 flex gap-2">
              <Input
                placeholder="Run a 5K"
                aria-label="Add a thing to your card"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setDuplicateNotice("");
                }}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                className="flex-1"
                maxLength={MAX_ITEM_LENGTH}
                disabled={items.length >= 24}
              />
              <Button
                onClick={addItem}
                size="icon"
                aria-label="Add to your card"
                disabled={items.length >= 24}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {duplicateNotice && (
              <p className="mt-2 font-semibold text-primary" role="alert">
                {duplicateNotice}
              </p>
            )}

            <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
              {items.length === 0 ? (
                <li className="py-3 text-muted-foreground">
                  Nothing yet. Add one above, or let us fill some in
                </li>
              ) : (
                items.map((item, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-center justify-between gap-1 bg-secondary",
                      editingIndex === index ? "pl-0" : "pl-4"
                    )}
                  >
                    {editingIndex === index ? (
                      <>
                        <textarea
                          value={editValue}
                          rows={1}
                          ref={(el) => {
                            if (el) {
                              el.style.height = "auto";
                              el.style.height = `${el.scrollHeight}px`;
                            }
                          }}
                          maxLength={MAX_ITEM_LENGTH}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              updateItem(index);
                            } else if (e.key === "Escape") {
                              cancelEdit();
                            }
                          }}
                          aria-label="Edit item"
                          className="min-h-12 min-w-0 flex-1 resize-none overflow-hidden bg-background px-4 py-3 text-base leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                          autoFocus
                          onFocus={(e) => {
                            const end = e.currentTarget.value.length;
                            e.currentTarget.setSelectionRange(end, end);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Save change"
                          onClick={() => updateItem(index)}
                          disabled={
                            !editValue.trim() ||
                            items.some(
                              (item, i) =>
                                i !== index && item.text === editValue.trim()
                            )
                          }
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Cancel edit"
                          onClick={cancelEdit}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex flex-1 items-center gap-2 py-3">
                          {item.text}
                          {item.isAutoFilled && (
                            <Sparkles
                              className="h-4 w-4 shrink-0 text-accent"
                              aria-label="Auto-filled"
                            />
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${item.text}`}
                          onClick={() => editItem(index)}
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${item.text}`}
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-lg font-bold" aria-live="polite">
                {items.length} of 24
              </p>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setItems([])}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>

            {items.length < 24 && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Need ideas? Pull from</h3>
                    <div className="flex">
                      {selectedThemes.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedThemes(["basic"]);
                            trackThemeSelected(["basic"]);
                          }}
                        >
                          Reset
                        </Button>
                      )}
                      {selectedThemes.length < SELECTABLE_THEMES.length && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const willSelectSpicy =
                              SELECTABLE_THEMES.includes("spicy") &&
                              !selectedThemes.includes("spicy");
                            if (willSelectSpicy && !isAgeVerified) {
                              setPendingSpicySelection(true);
                              setWasSelectingAll(true);
                              setShowAgeGate(true);
                            } else {
                              const allThemes = [...SELECTABLE_THEMES];
                              setSelectedThemes(allThemes);
                              trackThemeSelected(allThemes);
                            }
                          }}
                        >
                          Select all
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SELECTABLE_THEMES.map((theme) => {
                      const isSelected = selectedThemes.includes(theme);
                      return (
                        <Button
                          key={theme}
                          variant={isSelected ? "default" : "outline"}
                          aria-pressed={isSelected}
                          onClick={() => {
                            if (isSelected) {
                              if (selectedThemes.length > 1) {
                                const newThemes = selectedThemes.filter(
                                  (t) => t !== theme
                                );
                                setSelectedThemes(newThemes);
                                trackThemeSelected(newThemes);
                              }
                            } else {
                              if (theme === "spicy") {
                                if (!isAgeVerified) {
                                  setPendingSpicySelection(true);
                                  setWasSelectingAll(false);
                                  setShowAgeGate(true);
                                  return;
                                }
                              }
                              const newThemes = [...selectedThemes, theme];
                              setSelectedThemes(newThemes);
                              trackThemeSelected(newThemes);
                            }
                          }}
                          size="sm"
                          className="justify-start"
                        >
                          {isSelected && <Check className="mr-2 h-4 w-4" />}
                          {THEME_LABELS[theme]}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {selectedThemes.includes("spicy") && (
                  <div className="bg-secondary p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      <p>
                        Spicy is adult content. Only pick it if you and your
                        friends are comfortable with that
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3].map((level) => (
                        <Button
                          key={level}
                          variant={spicyLevel === level ? "default" : "outline"}
                          aria-pressed={spicyLevel === level}
                          onClick={() => setSpicyLevel(level as 1 | 2 | 3)}
                          className="flex-1 bg-background"
                          size="sm"
                        >
                          Level {level}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-3 text-muted-foreground">
                      Level 1 is moderate, level 3 is very explicit
                    </p>
                  </div>
                )}

                <Button
                  onClick={autoFillItems}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Fill in {24 - items.length} for me
                </Button>
              </div>
            )}

            <Button
              onClick={generateBingoCard}
              disabled={items.length !== 24}
              className={cn(
                "mt-3 w-full",
                items.length === 24 && "bg-accent text-accent-foreground"
              )}
              size="lg"
            >
              {items.length < 24
                ? `Add ${24 - items.length} more ${
                    24 - items.length === 1 ? "thing" : "things"
                  } to make your card`
                : items.length > 24
                ? `Remove ${items.length - 24} ${
                    items.length - 24 === 1 ? "thing" : "things"
                  } to make your card`
                : "Make my card"}
            </Button>
          </section>

          {/* Preview and Customization Container */}
          {bingoCard && (
            <div className="mx-auto max-w-2xl">
              {/* Preview */}
              <section aria-labelledby="card-heading" ref={previewRef}>
                <h2 id="card-heading" className="text-2xl font-bold text-primary">
                  Your card
                </h2>
                <div className="mt-5 w-full overflow-hidden bg-white">
                  <div ref={cardRef} className="mx-auto w-full max-w-md p-2 sm:p-4">
                    <BingoCard
                      items={bingoCard}
                      customization={customization}
                    />
                  </div>
                </div>
                <details className="group mt-6" ref={styleDetailsRef}>
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-xl font-bold text-primary [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2">
                      Style your card
                      <button
                        type="button"
                        aria-label="What does style do?"
                        aria-expanded={showStyleInfo}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!showStyleInfo && styleDetailsRef.current) {
                            styleDetailsRef.current.open = true;
                          }
                          setShowStyleInfo(!showStyleInfo);
                        }}
                        className="flex h-11 w-11 items-center justify-center"
                      >
                        <Info className="h-5 w-5" />
                      </button>
                    </span>
                    <ChevronDown className="h-6 w-6 transition-transform group-open:rotate-180" />
                  </summary>
                  {showStyleInfo && (
                    <p className="mb-4">
                      A style recolors the whole card. For example, Ocean makes
                      the squares blue and Forest makes them green. You can
                      still change any color under More color options
                    </p>
                  )}
                  <div className="mt-2">
              <Card>
                    <CardContent className="space-y-8">
                      {/* Presets */}
                      <div>
                        <label className="text-lg font-bold mb-3 block">
                          Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(presets).map(([key, preset]) => (
                            <Button
                              key={key}
                              variant="outline"
                              onClick={() => {
                                if (key === "random") {
                                  // Generate new random colors each time
                                  setCustomization(generateRandomPreset());
                                } else {
                                  setCustomization(preset.colors);
                                }
                              }}
                              className="h-auto py-3 flex flex-col items-center gap-1"
                            >
                              <div className="flex gap-1 items-center justify-center">
                                <div
                                  className="w-4 h-4 rounded flex-shrink-0 border"
                                  style={{
                                    backgroundColor:
                                      preset.colors.cellBackgroundColor,
                                    borderColor:
                                      preset.colors.cellBackgroundColor ===
                                        "#ffffff" ||
                                      preset.colors.cellBackgroundColor ===
                                        "#fef3c7" ||
                                      preset.colors.cellBackgroundColor ===
                                        "#e0f2fe" ||
                                      preset.colors.cellBackgroundColor ===
                                        "#dcfce7" ||
                                      preset.colors.cellBackgroundColor ===
                                        "#fee2e2"
                                        ? "#e5e7eb"
                                        : preset.colors.cellBorderColor,
                                    width: "16px",
                                    height: "16px",
                                    minWidth: "16px",
                                    minHeight: "16px",
                                  }}
                                />
                                <div
                                  className="w-4 h-4 rounded flex-shrink-0 border"
                                  style={{
                                    backgroundColor:
                                      preset.colors.freeCellBackgroundColor,
                                    borderColor:
                                      preset.colors.freeCellBackgroundColor ===
                                        "#ffffff" ||
                                      preset.colors.freeCellBackgroundColor ===
                                        "#fef3c7" ||
                                      preset.colors.freeCellBackgroundColor ===
                                        "#e0f2fe" ||
                                      preset.colors.freeCellBackgroundColor ===
                                        "#dcfce7" ||
                                      preset.colors.freeCellBackgroundColor ===
                                        "#fee2e2"
                                        ? "#e5e7eb"
                                        : preset.colors.freeCellBackgroundColor,
                                    width: "16px",
                                    height: "16px",
                                    minWidth: "16px",
                                    minHeight: "16px",
                                  }}
                                />
                              </div>
                              <span className="text-sm">{preset.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size and Border Size Controls */}
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-base font-semibold">
                            Text size: {customization.cellFontSize.toFixed(1)}x
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
                              className="flex-1 h-6 appearance-none cursor-pointer"
                            />
                            <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                              {customization.cellFontSize.toFixed(1)}x
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-base font-semibold">
                            Border: {customization.cellBorderSize}px
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
                              className="flex-1 h-6 appearance-none cursor-pointer"
                            />
                            <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                              {customization.cellBorderSize}px
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Toggle */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        aria-expanded={showAdvanced}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                      >
                        <Palette className="mr-2 h-5 w-5" />
                        {showAdvanced ? "Hide color options" : "More color options"}
                      </Button>

                      {/* Advanced Color Options */}
                      {showAdvanced && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                Cell Background
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customization.cellBackgroundColor}
                                  onChange={(e) =>
                                    setCustomization({
                                      ...customization,
                                      cellBackgroundColor: e.target.value,
                                    })
                                  }
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                Cell Text
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customization.cellTextColor}
                                  onChange={(e) =>
                                    setCustomization({
                                      ...customization,
                                      cellTextColor: e.target.value,
                                    })
                                  }
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                Cell Border
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customization.cellBorderColor}
                                  onChange={(e) =>
                                    setCustomization({
                                      ...customization,
                                      cellBorderColor: e.target.value,
                                    })
                                  }
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                FREE Background
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customization.freeCellBackgroundColor}
                                  onChange={(e) =>
                                    setCustomization({
                                      ...customization,
                                      freeCellBackgroundColor: e.target.value,
                                    })
                                  }
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                FREE Text
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customization.freeCellTextColor}
                                  onChange={(e) =>
                                    setCustomization({
                                      ...customization,
                                      freeCellTextColor: e.target.value,
                                    })
                                  }
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                Title Color
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customization.titleColor}
                                  onChange={(e) =>
                                    setCustomization({
                                      ...customization,
                                      titleColor: e.target.value,
                                    })
                                  }
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                Footer Color
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customization.footerColor}
                                  onChange={(e) =>
                                    setCustomization({
                                      ...customization,
                                      footerColor: e.target.value,
                                    })
                                  }
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            <div className="space-y-2">
                              <label className="text-base font-semibold">
                                Card Background
                              </label>
                              <div className="flex gap-2">
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
                                  className="h-12 w-16 rounded cursor-pointer"
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
                            Back to Classic
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  </div>
                </details>

                <div className="mt-3 space-y-3">
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name (shows on the link you send)"
                    aria-label="Your first name (optional)"
                    maxLength={24}
                    autoComplete="given-name"
                    spellCheck={false}
                  />
                  <Button
                    onClick={handleSaveCard}
                    className="w-full"
                    size="lg"
                    disabled={savingCard}
                  >
                    {savingCard ? (
                      "Saving"
                    ) : (
                      <>
                        <Share2 className="mr-2 h-5 w-5" />
                        Save and share
                      </>
                    )}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handlePrint} variant="outline">
                      <Printer className="mr-2 h-5 w-5" />
                      Print
                    </Button>
                    <Button onClick={randomizeCard} variant="outline">
                      <Shuffle className="mr-2 h-5 w-5" />
                      Shuffle
                    </Button>
                  </div>
                  <p className="text-muted-foreground">
                    Want a picture? Print it and pick Save as PDF
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* Got a code from a friend? */}
          <section className="mx-auto max-w-2xl" aria-labelledby="open-heading">
            <h2 id="open-heading" className="text-2xl font-bold text-primary">
              Got a code from a friend?
            </h2>
            <div className="mt-5 flex gap-2">
              <Input
                placeholder="Card code"
                aria-label="Card code"
                value={loadCodeInput}
                onChange={(e) => setLoadCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleLoadCard()}
                className="flex-1 uppercase tracking-widest"
                maxLength={6}
              />
              <Button
                onClick={handleLoadCard}
                disabled={loadingCard || loadCodeInput.length !== 6}
              >
                {loadingCard ? "Opening" : "Open"}
              </Button>
            </div>
          </section>

          {/* Questions */}
          <section className="mx-auto max-w-2xl" aria-labelledby="questions-heading">
            <h2 id="questions-heading" className="text-2xl font-bold text-primary">
              Questions
            </h2>
            <div className="mt-3">
              {[
                ["Can I print it?", "Yep. Hit Print, then pick paper or Save as PDF"],
                ["Who can see my card?", "Only people you send the link or code to. Search engines can\u2019t find it"],
                ["How many do I need?", "24. The middle square is free"],
                ["Can I change it after I send it?", "Not once it\u2019s saved. Open it, hit Edit as new, and you get a copy to change"],
              ].map(([question, answer]) => (
                <details key={question} className="group">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 text-lg font-bold [&::-webkit-details-marker]:hidden">
                    {question}
                    <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-3">{answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Bingo Pool Signup Section */}
          <section className="mx-auto max-w-2xl">
            <BingoPoolSignup />
          </section>
        </div>
      </div>
      {/* 18+ Age Gate Dialog */}
      <Dialog
        open={showAgeGate}
        onOpenChange={(open) => {
          setShowAgeGate(open);
          if (!open) {
            // Dialog is closing, reset flags to prevent inconsistent state
            setPendingSpicySelection(false);
            setWasSelectingAll(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adults only</DialogTitle>
            <DialogDescription>
              The Spicy category has explicit sexual content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="font-semibold">By continuing you confirm that</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>You are 18 or older</li>
              <li>You are fine with seeing explicit content</li>
              <li>You will not share it with minors</li>
            </ul>
            <p className="text-muted-foreground">
              Everything in it is meant to be legal, consensual and private
            </p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setShowAgeGate(false);
                setPendingSpicySelection(false);
                setWasSelectingAll(false);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsAgeVerified(true);
                localStorage.setItem("spicy_age_verified", "true");
                setShowAgeGate(false);
                if (pendingSpicySelection) {
                  // If they were trying to select all, select all themes
                  if (wasSelectingAll) {
                    const allThemes = [...SELECTABLE_THEMES] as Theme[];
                    setSelectedThemes(allThemes);
                    trackThemeSelected(allThemes);
                  } else {
                    const newThemes = [...selectedThemes, "spicy"] as Theme[];
                    setSelectedThemes(newThemes);
                    trackThemeSelected(newThemes);
                  }
                  setPendingSpicySelection(false);
                  setWasSelectingAll(false);
                }
              }}
              className="w-full sm:w-auto"
            >
              I am 18 or older
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your card is saved</DialogTitle>
            <DialogDescription>
              Send the link to your friends, or give them the code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <p className="font-semibold">Card code</p>
              <p className="mt-1 text-3xl font-bold tracking-widest">
                {savedCardCode?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="font-semibold">Link</p>
              <div className="mt-1 flex gap-2">
                <Input
                  readOnly
                  aria-label="Shareable link"
                  value={
                    savedCardCode
                      ? `${window.location.origin}/card/${savedCardCode}`
                      : ""
                  }
                  className="flex-1"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  aria-label={copySuccess ? "Link copied" : "Copy link"}
                >
                  {copySuccess ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {copySuccess && (
                <p className="mt-2 text-muted-foreground" aria-live="polite">
                  Link copied
                </p>
              )}
            </div>
            <p className="text-muted-foreground">
              Anyone with the link can see and print it. Your original never
              changes
            </p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            {savedCardCode && (
              <Button
                onClick={() => {
                  window.open(`/card/${savedCardCode}`, "_blank");
                }}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View card
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

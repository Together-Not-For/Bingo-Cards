"use client";

import { BingoCard, BingoCardCustomization } from "@/components/BingoCard";
import Footer from "@/components/common/Footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  trackCardLoaded,
  trackCardPrinted,
  trackEditAsNew,
} from "@/lib/analytics";
import { cardFaceTitle, cardTitle, cleanFirstName } from "@/lib/cardTitle";
import { escapePrintText, safePrintCustomization } from "@/lib/printSafety";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CardData {
  code: string;
  items: string[];
  customization: Partial<BingoCardCustomization>;
  createdAt: string;
}

export default function SharedCardPage({
  params,
}: {
  params: { code: string };
}) {
  const router = useRouter();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCard() {
      try {
        const response = await fetch(`/api/cards/${params.code}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Card not found. This code may be invalid or expired.");
          } else {
            setError("Failed to load card. Please try again later.");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setCardData(data);
        
        // Track card load
        trackCardLoaded("url", params.code);
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("Failed to load card. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [params.code]);

  const handlePrint = () => {
    if (!cardData) return;
    
    // Track print event
    trackCardPrinted(cardData.code);

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const faceTitle = cardFaceTitle(
        cleanFirstName(
          (cardData.customization as { firstName?: unknown } | undefined)
            ?.firstName
        )
      );
      const printCustomization = safePrintCustomization(cardData.customization || {});

      const getFontSize = (text: string) => {
        const fontSizeMultiplier = printCustomization.cellFontSize || 1.0;
        const length = text.length;
        let baseSize = 1.0;

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
            <title>2026 Bingo Card - ${escapePrintText(cardData.code)}</title>
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
                /* Lay out at paper width so text is fitted for the printed page, even from a phone */
                min-width: 660px;
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
                border-radius: 4px;
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
              .bingo-cell.alt {
                background: ${
                  printCustomization.altCellBackgroundColor ||
                  printCustomization.cellBackgroundColor
                } !important;
              }
              .bingo-cell.alt > span {
                color: ${
                  printCustomization.altCellTextColor ||
                  printCustomization.cellTextColor
                } !important;
              }
              .bingo-cell.free {
                background: ${printCustomization.freeCellBackgroundColor} !important;
              }
              .bingo-cell.free > span {
                color: ${printCustomization.freeCellTextColor} !important;
                font-size: 1.5rem;
                font-weight: bold;
                padding: 0;
                white-space: nowrap;
                overflow: visible;
                text-overflow: clip;
                display: flex;
                flex-direction: column;
                gap: 6px;
                align-items: center;
                justify-content: center;
              }
              .bingo-cell.free > span::before {
                content: "\\2665";
                font-size: 2rem;
                line-height: 1;
              }
              .bingo-footer {
                text-align: center;
                color: ${printCustomization.footerColor};
                font-size: 0.875rem;
                margin-top: 16px;
              }
              .bingo-code {
                text-align: center;
                color: ${printCustomization.footerColor};
                font-size: 0.75rem;
                margin-top: 8px;
                font-family: monospace;
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
                  min-width: 0;
                }
                .bingo-container {
                  margin: 0 auto;
                  max-width: 100%;
                }
              }
            </style>
          </head>
          <body>
            <div class="bingo-container">
              <h1 class="bingo-title">${escapePrintText(faceTitle)}</h1>
              <div class="bingo-grid">
                ${cardData.items
                  .map(
                    (item, index) =>
                      `<div class="bingo-cell ${
                        index === 12 ? "free" : ""
                      } ${
                        printCustomization.altCellBackgroundColor &&
                        index !== 12 &&
                        (Math.floor(index / 5) + (index % 5)) % 2 === 1
                          ? "alt"
                          : ""
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
              <div class="bingo-footer">Made by Together, Not For</div>
              <div class="bingo-code">Code: ${escapePrintText(cardData.code)}</div>
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

  const handleEditAsNew = () => {
    if (!cardData) return;
    
    // Track edit as new event
    trackEditAsNew(cardData.code);
    
    // Encode the card data in URL params and redirect to home
    const itemsParam = encodeURIComponent(JSON.stringify(cardData.items));
    const customizationParam = encodeURIComponent(
      JSON.stringify(cardData.customization || {})
    );
    
    router.push(
      `/?loadCard=true&items=${itemsParam}&customization=${customizationParam}`
    );
  };

  const header = (
    <header className="flex items-center justify-between">
      <Link href="/">
        <Button variant="ghost" size="sm" className="-ml-4">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Make yours
        </Button>
      </Link>
      <ThemeToggle />
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-2xl px-4 pt-4 sm:px-6">
          {header}
          <p className="py-20 text-center text-muted-foreground" role="status">
            Opening card
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-2xl px-4 pt-4 sm:px-6">
          {header}
          <section className="mt-6">
            <h1 className="text-4xl font-bold leading-tight text-primary">
              We couldn&apos;t find that card
            </h1>
            <p className="mt-4 text-lg">
              {error ||
                `The code ${params.code.toUpperCase()} may have a typo, or the card may have been removed`}
            </p>
            <Link href="/">
              <Button className="mt-6 w-full sm:w-auto" size="lg">
                Make a new card
              </Button>
            </Link>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  const firstName = cleanFirstName(
    (cardData.customization as { firstName?: unknown } | undefined)?.firstName
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 sm:px-6">
        {header}

        <section className="mt-4">
          <h1 className="text-4xl font-bold leading-tight text-primary sm:text-5xl">
            {cardTitle(firstName)}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Card code {cardData.code.toUpperCase()}
          </p>
        </section>

        <div className="mt-6 w-full overflow-hidden bg-white">
          <div className="mx-auto w-full max-w-md p-2 sm:p-4">
            <BingoCard
              items={cardData.items}
              title={cardFaceTitle(firstName)}
              customization={cardData.customization}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button onClick={handleEditAsNew} className="w-full" size="lg">
            <Edit className="mr-2 h-5 w-5" />
            Edit as new
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print
          </Button>
          <p className="text-muted-foreground">
            Want to change it? Edit as new makes a copy and leaves this one alone
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

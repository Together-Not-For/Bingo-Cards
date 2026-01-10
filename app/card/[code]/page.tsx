"use client";

import { BingoCard, BingoCardCustomization } from "@/components/BingoCard";
import Footer from "@/components/common/Footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const customization = {
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
        ...cardData.customization,
      };

      const getFontSize = (text: string) => {
        const fontSizeMultiplier = customization.cellFontSize || 1.0;
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
            <title>2026 Bingo Card - ${cardData.code}</title>
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
              .bingo-code {
                text-align: center;
                color: ${customization.footerColor};
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
              <h1 class="bingo-title">2026 BINGO</h1>
              <div class="bingo-grid">
                ${cardData.items
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
              <div class="bingo-code">Code: ${cardData.code}</div>
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

  const handleEditAsNew = () => {
    if (!cardData) return;
    
    // Encode the card data in URL params and redirect to home
    const itemsParam = encodeURIComponent(JSON.stringify(cardData.items));
    const customizationParam = encodeURIComponent(
      JSON.stringify(cardData.customization)
    );
    
    router.push(
      `/?loadCard=true&items=${itemsParam}&customization=${customizationParam}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
        <Footer textColor="#6b7280" iconColor="#bf8104" />
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-2 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  Card Not Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {error || "This bingo card could not be found."}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The code <span className="font-mono font-bold">{params.code.toUpperCase()}</span> may be invalid or the card may have been removed.
                </p>
                <Link href="/">
                  <Button className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer textColor="#6b7280" iconColor="#bf8104" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Shared Bingo Card
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Code:{" "}
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {cardData.code.toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Created on {new Date(cardData.createdAt).toLocaleDateString()}
            </p>
          </div>

          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Your Bingo Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-inner">
                <BingoCard
                  items={cardData.items}
                  customization={cardData.customization}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Card
                </Button>
                <Button
                  onClick={handleEditAsNew}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit as New
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-1">
                  💡 Share this card:
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Anyone with this link can view this bingo card. Click &quot;Edit as
                  New&quot; to create your own version.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer textColor="#6b7280" iconColor="#bf8104" />
    </div>
  );
}


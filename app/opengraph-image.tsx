import { ogSize, renderOgImage } from "@/lib/ogImage";

export const alt = "2026 bingo card creator";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    headline: "2026 bingo card creator",
    subline: "Pick 24 goals and send the card to your friends",
  });
}

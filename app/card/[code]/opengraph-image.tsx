import { cardTitle } from "@/lib/cardTitle";
import { getCardFirstName } from "@/lib/cardMeta";
import { ogSize, renderOgImage } from "@/lib/ogImage";

export const alt = "A 2026 bingo card";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: { code: string } }) {
  return renderOgImage({
    headline: cardTitle(await getCardFirstName(params.code)),
    subline: `Share code: ${params.code}`,
  });
}

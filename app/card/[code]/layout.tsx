import type { Metadata } from "next";
import { cardTitle } from "@/lib/cardTitle";
import { getCardFirstName } from "@/lib/cardMeta";

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const title = cardTitle(await getCardFirstName(params.code));
  const description = "Open the card to see the goals, or make one of your own";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

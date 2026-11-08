import { ImageResponse } from "next/og";
import { cardTitle } from "@/lib/cardTitle";
import { getCardFirstName } from "@/lib/cardMeta";

export const alt = "A Together, Not For bingo card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#24382C";
const TERRACOTTA = "#D4693A";
const CREAM = "#FFFBF5";

export default async function Image({ params }: { params: { code: string } }) {
  const title = cardTitle(await getCardFirstName(params.code));
  const cells = Array.from({ length: 25 });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: GREEN,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: CREAM,
            width: 560,
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: 34, marginTop: 28 }}>
            Open the card to see the goals
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 470,
            gap: 10,
          }}
        >
          {cells.map((_, i) => (
            <div
              key={i}
              style={{
                width: 86,
                height: 86,
                background: i === 12 ? TERRACOTTA : CREAM,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size
  );
}

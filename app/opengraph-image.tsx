import { ImageResponse } from "next/og";

export const alt = "Together, Not For Bingo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#24382C";
const TERRACOTTA = "#D4693A";
const CREAM = "#FFFBF5";

export default function Image() {
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
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
            Your 2026 goals, as a bingo card
          </div>
          <div style={{ fontSize: 34, marginTop: 28 }}>Together, Not For</div>
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

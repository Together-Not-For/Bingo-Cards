import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// Hex versions of the light theme tokens in app/globals.css
const BACKGROUND = "#EAD6E4";
const INK = "#4C2A45";
const PAPER = "#FFFAFD";
const ROSE = "#913B4C";

// Satori can't read next/font, so pull Figtree straight from Google Fonts.
// If that fails the image still renders with the default font.
async function loadFigtree(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Figtree:wght@${weight}`
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function renderOgImage({
  headline,
  subline,
}: {
  headline: string;
  subline: string;
}) {
  const [bold, medium] = await Promise.all([loadFigtree(700), loadFigtree(500)]);
  const fonts = [
    bold && { name: "Figtree", data: bold, weight: 700 as const },
    medium && { name: "Figtree", data: medium, weight: 500 as const },
  ].filter((font) => !!font);

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
          background: BACKGROUND,
          padding: "0 80px",
          fontFamily: "Figtree",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: INK,
            width: 540,
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05, color: ROSE }}>
            {headline}
          </div>
          <div style={{ fontSize: 34, fontWeight: 500, marginTop: 32 }}>{subline}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 490,
            gap: 10,
            padding: 20,
            background: PAPER,
            borderRadius: 16,
          }}
        >
          {cells.map((_, i) => (
            <div
              key={i}
              style={{
                width: 82,
                height: 82,
                borderRadius: 4,
                // Patchwork: every other square in ink, free space in rose
                background: i === 12 ? ROSE : i % 2 === 1 ? INK : BACKGROUND,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...ogSize, fonts: fonts.length ? fonts : undefined }
  );
}

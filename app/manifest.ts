import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Together, Not For Bingo",
    short_name: "Bingo",
    description: "Pick 24 things you want to do in 2026 and make a bingo card",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF5",
    theme_color: "#24382C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

export function cleanFirstName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[^\p{L}\p{M}\s'’-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

export function cardTitle(firstName: string): string {
  return firstName ? `${firstName}'s 2026 bingo` : "A 2026 bingo card";
}

export function cardFaceTitle(firstName: string): string {
  return firstName ? `${firstName}'s 2026 bingo` : "2026 Bingo";
}

import { neon } from "@neondatabase/serverless";
import { cleanFirstName } from "@/lib/cardTitle";

export async function getCardFirstName(code: string): Promise<string> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !/^[A-Za-z0-9]{6}$/.test(code)) return "";
  try {
    const sql = neon(connectionString);
    const rows = await sql`
      SELECT customization FROM bingo.bingo_cards
      WHERE UPPER(code) = UPPER(${code}) LIMIT 1
    `;
    return cleanFirstName(rows[0]?.customization?.firstName);
  } catch {
    return "";
  }
}

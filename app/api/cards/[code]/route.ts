import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    // Validate code format (6 characters, alphanumeric)
    if (!code || !/^[A-Z0-9]{6}$/i.test(code)) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 }
      );
    }

    // Get Neon connection string from environment variable
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error("DATABASE_URL not configured");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(connectionString);

    // Fetch the card from the database
    const result = await sql`
      SELECT code, items, customization, created_at
      FROM bingo.bingo_cards
      WHERE UPPER(code) = UPPER(${code})
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    const card = result[0];

    return NextResponse.json(
      {
        code: card.code,
        items: card.items,
        customization: card.customization,
        createdAt: card.created_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bingo card:", error);

    return NextResponse.json(
      { error: "Failed to fetch card. Please try again later." },
      { status: 500 }
    );
  }
}


import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

// Characters to use in the short code (excluding ambiguous ones like 0, O, 1, I, L)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Generate a random 6-character code
function generateCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customization } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length !== 25) {
      return NextResponse.json(
        { error: "Invalid items array. Must contain exactly 25 items." },
        { status: 400 }
      );
    }

    // Get Neon connection string from environment variable
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error("DATABASE_URL not configured");
      // In development, return a mock code
      if (process.env.NODE_ENV === "development") {
        const mockCode = generateCode();
        console.log("Bingo Card Save (dev mode):", {
          code: mockCode,
          items,
          customization,
        });
        return NextResponse.json(
          {
            message: "Card saved (development mode - DATABASE_URL not set)",
            code: mockCode,
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(connectionString);

    // Try to generate a unique code (max 10 attempts)
    let code = "";
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = generateCode();
      attempts++;

      try {
        // Try to insert the card
        await sql`
          INSERT INTO bingo.bingo_cards (code, items, customization)
          VALUES (${code}, ${JSON.stringify(items)}, ${JSON.stringify(customization)})
        `;
        
        // Success! Break out of the loop
        break;
      } catch (error) {
        // Check if it's a duplicate code error
        if (error instanceof Error && error.message.includes("duplicate")) {
          // Try again with a new code
          if (attempts >= maxAttempts) {
            throw new Error("Failed to generate unique code after multiple attempts");
          }
          continue;
        }
        // Some other error, rethrow it
        throw error;
      }
    }

    return NextResponse.json(
      { 
        message: "Card saved successfully!",
        code 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving bingo card:", error);

    return NextResponse.json(
      { error: "Failed to save card. Please try again later." },
      { status: 500 }
    );
  }
}


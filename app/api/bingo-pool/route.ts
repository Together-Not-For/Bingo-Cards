import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phoneNumber } = body;

    // Validate input
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: "Name and phone number are required" },
        { status: 400 }
      );
    }

    // Basic phone number validation (remove non-digits for storage)
    const cleanedPhone = phoneNumber.replace(/\D/g, "");

    if (cleanedPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Get Neon connection string from environment variable
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error("DATABASE_URL not configured");
      // In development, log the data
      if (process.env.NODE_ENV === "development") {
        console.log("Bingo Pool Signup (dev mode):", {
          name,
          phoneNumber: cleanedPhone,
        });
        return NextResponse.json(
          {
            message:
              "Signup received (development mode - DATABASE_URL not set)",
            data: { name, phoneNumber: cleanedPhone },
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Connect to Neon and insert the signup into public.bingo_pool_signups
    const sql = neon(connectionString);
    await sql`
      INSERT INTO public.bingo_pool_signups (name, phone_number)
      VALUES (${name.trim()}, ${cleanedPhone})
    `;

    return NextResponse.json(
      { message: "Successfully signed up for the bingo pool!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing signup:", error);

    // Check if it's a duplicate entry error
    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "This phone number is already registered." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process signup. Please try again later." },
      { status: 500 }
    );
  }
}

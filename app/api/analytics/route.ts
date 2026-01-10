import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_name, event_data } = body;

    // Validate input
    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json(
        { error: "event_name is required and must be a string" },
        { status: 400 }
      );
    }

    // Get Neon connection string from environment variable
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      // In development, log the event instead of failing
      if (process.env.NODE_ENV === "development") {
        console.log("Analytics Event (dev mode - DATABASE_URL not set):", {
          event_name,
          event_data,
        });
        return NextResponse.json(
          { message: "Event logged (development mode)" },
          { status: 200 }
        );
      }
      // In production, fail silently to not break user experience
      return NextResponse.json(
        { message: "Event received" },
        { status: 200 }
      );
    }

    const sql = neon(connectionString);

    // Get request metadata
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;
    const pageUrl = request.url || null;

    // Insert the analytics event
    await sql`
      INSERT INTO bingo.analytics_events (event_name, event_data, user_agent, referrer, page_url)
      VALUES (${event_name}, ${JSON.stringify(event_data || {})}, ${userAgent}, ${referrer}, ${pageUrl})
    `;

    return NextResponse.json(
      { message: "Event tracked successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Fail silently to not break user experience
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { message: "Event received" },
      { status: 200 }
    );
  }
}


/**
 * Analytics utility for tracking custom events
 * Events are sent to the /api/analytics endpoint and stored in Postgres
 */

type EventData = Record<string, any>;

/**
 * Track a custom analytics event
 * This is a fire-and-forget operation that won't block the UI
 */
export function trackEvent(eventName: string, eventData?: EventData): void {
  // Only track in browser environment
  if (typeof window === "undefined") {
    return;
  }

  // Fire and forget - don't await to avoid blocking
  fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_name: eventName,
      event_data: eventData || {},
    }),
  }).catch((error) => {
    // Silently fail - analytics should never break the user experience
    console.error("Analytics tracking error:", error);
  });
}

/**
 * Track card generation event
 */
export function trackCardGenerated(): void {
  trackEvent("card_generated");
}

/**
 * Track card save event
 */
export function trackCardSaved(cardCode: string): void {
  trackEvent("card_saved", { card_code: cardCode });
}

/**
 * Track card load event
 */
export function trackCardLoaded(
  source: "code" | "url",
  cardCode?: string
): void {
  trackEvent("card_loaded", {
    source,
    card_code: cardCode,
  });
}

/**
 * Track card print event
 */
export function trackCardPrinted(cardCode?: string): void {
  trackEvent("card_printed", {
    card_code: cardCode,
  });
}

/**
 * Track theme selection event
 */
export function trackThemeSelected(themes: string[]): void {
  trackEvent("theme_selected", {
    themes,
  });
}

/**
 * Track edit as new event
 */
export function trackEditAsNew(cardCode: string): void {
  trackEvent("edit_as_new", {
    card_code: cardCode,
  });
}

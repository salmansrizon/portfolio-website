// ── Service Factory ──────────────────────────────────────────────────────────
// Creates a service instance with the provided adapter.
// Follows the same pattern as createRepository from issue-2.
// Wraps adapter methods with error handling to ensure analytics never breaks the app.

import { AnalyticsService } from './analytics';

// Singleton instance
let singletonInstance: AnalyticsService | null = null;

// Wrapper that adds error handling to adapter methods
function createSafeAdapter(adapter: AnalyticsService): AnalyticsService {
  return {
    trackPageView(pagePath: string, visitorId: string): void {
      try {
        adapter.trackPageView(pagePath, visitorId);
      } catch (error) {
        console.error('Analytics error (non-blocking):', error);
      }
    },

    async flush(): Promise<void> {
      try {
        await adapter.flush();
      } catch (error) {
        console.error('Analytics error (non-blocking):', error);
      }
    },
  };
}

export function createAnalyticsService(adapter: AnalyticsService): AnalyticsService {
  // Return singleton if already created
  if (singletonInstance) {
    return singletonInstance;
  }

  // Wrap adapter with error handling and create singleton
  singletonInstance = createSafeAdapter(adapter);
  return singletonInstance;
}

// Helper to reset singleton (for testing)
export function resetAnalyticsService(): void {
  singletonInstance = null;
}

// ── Analytics Service Interface ──────────────────────────────────────────────
// Singleton analytics service with Supabase and Console (test) adapters.
// Tracks page views (with duration) and click events.

export interface AnalyticsEvent {
  type: 'page_view' | 'click' | 'custom';
  page_path: string;
  visitor_id: string;
  event_name?: string;  // for clicks
  duration_secs?: number;  // for page views
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsService {
  trackPageView(pagePath: string, visitorId: string): void;
  trackClick(eventName: string, pagePath: string, visitorId: string): void;
  trackCustom(eventName: string, metadata: Record<string, unknown>): void;
  flush(): Promise<void>;  // send queued events (for batching later)
}

// ── Supabase Analytics Adapter ────────────────────────────────────────────────
// Sends analytics events to Supabase `page_views` (and future `analytics_events`) table.

class SupabaseAnalyticsAdapter implements AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private visitorId: string;

  constructor() {
    this.visitorId = this.getVisitorId();
  }

  private getVisitorId(): string {
    const key = 'analytics_visitor_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  }

  trackPageView(pagePath: string, visitorId: string): void {
    const event: AnalyticsEvent = {
      type: 'page_view',
      page_path: pagePath,
      visitor_id: visitorId || this.visitorId,
      timestamp: new Date().toISOString(),
    };
    this.sendEvent(event);
  }

  trackClick(eventName: string, pagePath: string, visitorId: string): void {
    const event: AnalyticsEvent = {
      type: 'click',
      page_path: pagePath,
      visitor_id: visitorId || this.visitorId,
      event_name: eventName,
      timestamp: new Date().toISOString(),
    };
    this.sendEvent(event);
  }

  trackCustom(eventName: string, metadata: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      type: 'custom',
      page_path: window.location.pathname,
      visitor_id: this.visitorId,
      event_name: eventName,
      metadata,
      timestamp: new Date().toISOString(),
    };
    this.sendEvent(event);
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      // Send immediately (no batching for now)
      await supabase
        .from('page_views')
        .insert({
          page_path: event.page_path,
          visitor_id: event.visitor_id,
          event_type: event.type,
          event_name: event.event_name,
          duration_secs: event.duration_secs,
          metadata: event.metadata,
        });
    } catch (error) {
      console.error('Analytics error (non-blocking):', error);
      // Don't throw — analytics should never break the app
    }
  }

  async flush(): Promise<void> {
    // No-op for now (immediate send)
    // Will be implemented when batching is added
  }
}

// ── Console Analytics Adapter (for tests) ─────────────────────────────────────
// Logs analytics events to console instead of sending to Supabase.

class ConsoleAnalyticsAdapter implements AnalyticsService {
  trackPageView(pagePath: string, visitorId: string): void {
    console.log('[Analytics] Page View:', { pagePath, visitorId });
  }

  trackClick(eventName: string, pagePath: string, visitorId: string): void {
    console.log('[Analytics] Click:', { eventName, pagePath, visitorId });
  }

  trackCustom(eventName: string, metadata: Record<string, unknown>): void {
    console.log('[Analytics] Custom:', { eventName, metadata });
  }

  async flush(): Promise<void> {
    // No-op
  }
}

// ── Singleton Analytics Service ───────────────────────────────────────────────
// Use createService factory for dependency injection.
// Configure once in App.tsx or main.tsx.

import { createAnalyticsService as createService } from './createService';

let analyticsInstance: AnalyticsService | null = null;

export function configureAnalytics(service: AnalyticsService) {
  analyticsInstance = service;
}

export function getAnalytics(): AnalyticsService {
  if (!analyticsInstance) {
    // Default to Supabase in prod, Console in test/dev
    const isDev = import.meta.env.DEV;
    const defaultAdapter = isDev
      ? new ConsoleAnalyticsAdapter()
      : new SupabaseAnalyticsAdapter();
    analyticsInstance = createService(defaultAdapter);
  }
  return analyticsInstance;
}

// ── React Hooks ───────────────────────────────────────────────────────────────
// usePageView enhanced with duration tracking
// useClickTracking for manual click tracking

import { useEffect, useRef } from 'react';
import { getAnalytics } from './analytics';

export function usePageView(pagePath: string) {
  const startTime = useRef<number>(Date.now());
  const analytics = getAnalytics();

  useEffect(() => {
    // Track page view on mount
    const visitorId = getVisitorId();
    analytics.trackPageView(pagePath, visitorId);

    // Track duration on unmount
    return () => {
      const durationSecs = Math.round((Date.now() - startTime.current) / 1000);
      if (durationSecs > 0) {
        // Send duration as a separate event or update the page_views record
        // For now, just log it (Supabase table needs a duration column)
        console.log('[Analytics] Page duration:', { pagePath, durationSecs });
      }
    };
  }, [pagePath]);
}

export function useClickTracking() {
  const analytics = getAnalytics();

  const trackClick = (eventName: string) => {
    const visitorId = getVisitorId();
    const pagePath = window.location.pathname;
    analytics.trackClick(eventName, pagePath, visitorId);
  };

  return { trackClick };
}

// ── Visitor ID helper (shared with analytics service) ─────────────────────────
function getVisitorId(): string {
  const key = 'analytics_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

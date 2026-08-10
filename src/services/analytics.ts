// ── Analytics Service Interface ──────────────────────────────────────────────
// Singleton analytics service with Supabase and Console (test) adapters.
// Tracks page views — the only thing the `page_views` table can hold.
//
// This used to also promise click and custom-event tracking (event_name,
// duration_secs, metadata), but page_views has no columns for any of that,
// so those fields were queued and silently dropped at flush(). Rather than
// carry an interface that lies about what it persists, it was shrunk to
// what the schema can actually store. Re-add click/custom tracking once
// there's a column (or table) for it to land in.

import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  page_path: string;
  visitor_id: string;
  timestamp: string;
}

export interface AnalyticsService {
  trackPageView(pagePath: string, visitorId: string): void;
  flush(): Promise<void>;  // send queued events (for batching later)
}

// ── Supabase Analytics Adapter ────────────────────────────────────────────────
// Sends analytics events to Supabase `page_views` (and future `analytics_events`) table.

export const FLUSH_INTERVAL_MS = 10_000;

export class SupabaseAnalyticsAdapter implements AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private visitorId: string;
  private flushIntervalId: ReturnType<typeof setInterval> | null = null;
  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') this.flush();
  };
  private handleBeforeUnload = () => {
    this.flush();
  };

  constructor() {
    this.visitorId = this.getVisitorId();

    if (typeof window !== 'undefined') {
      this.flushIntervalId = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
      // 'visibilitychange' fires reliably when a tab is backgrounded/closed on
      // mobile, where 'beforeunload' often doesn't — flush on both for the
      // best realistic chance of not losing the final batch.
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
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
      page_path: pagePath,
      visitor_id: visitorId || this.visitorId,
      timestamp: new Date().toISOString(),
    };
    this.sendEvent(event);
  }

  private sendEvent(event: AnalyticsEvent) {
    this.queue.push(event);
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    const batch = this.queue;
    this.queue = [];

    try {
      await supabase.from('page_views').insert(
        batch.map((e) => ({
          page_path: e.page_path,
          visitor_id: e.visitor_id,
        }))
      );
    } catch (error) {
      console.error('Analytics error (non-blocking):', error);
      // Don't throw — analytics should never break the app
    }
  }

  // Tears down the interval/listeners this instance registered. The
  // long-lived singleton from getAnalytics() never calls this, but tests
  // that construct their own instances should, to avoid leaking timers and
  // document/window listeners across test cases.
  destroy(): void {
    if (this.flushIntervalId !== null) clearInterval(this.flushIntervalId);
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }
}

// ── Console Analytics Adapter (for tests) ─────────────────────────────────────
// Logs analytics events to console instead of sending to Supabase.

class ConsoleAnalyticsAdapter implements AnalyticsService {
  trackPageView(pagePath: string, visitorId: string): void {
    console.log('[Analytics] Page View:', { pagePath, visitorId });
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

import { useEffect, useRef } from 'react';

export function usePageView(pagePath: string) {
  const startTime = useRef<number>(Date.now());
  const analytics = getAnalytics();

  useEffect(() => {
    // Track page view on mount
    analytics.trackPageView(pagePath, '');

    // Track duration on unmount
    return () => {
      const durationSecs = Math.round((Date.now() - startTime.current) / 1000);
      if (durationSecs > 0) {
        // Not persisted: page_views has no duration column, and adding one
        // is a schema migration beyond batching this event pipeline.
        console.log('[Analytics] Page duration:', { pagePath, durationSecs });
      }
    };
  }, [pagePath]);
}

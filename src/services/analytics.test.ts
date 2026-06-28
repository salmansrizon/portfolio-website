import { describe, it, expect, beforeEach } from 'vitest';
import { createAnalyticsService, resetAnalyticsService } from './createService';
import { AnalyticsService, AnalyticsEvent } from './analytics';

// Mock adapter for testing
class MockAnalyticsAdapter implements AnalyticsService {
  public events: AnalyticsEvent[] = [];

  trackPageView(pagePath: string, visitorId: string): void {
    this.events.push({
      type: 'page_view',
      page_path: pagePath,
      visitor_id: visitorId,
      timestamp: new Date().toISOString(),
    });
  }

  trackClick(eventName: string, pagePath: string, visitorId: string): void {
    this.events.push({
      type: 'click',
      page_path: pagePath,
      visitor_id: visitorId,
      event_name: eventName,
      timestamp: new Date().toISOString(),
    });
  }

  trackCustom(eventName: string, metadata: Record<string, unknown>): void {
    this.events.push({
      type: 'custom',
      page_path: '/',
      visitor_id: 'test-visitor', // Note: custom events don't take visitorId param
      event_name: eventName,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  async flush(): Promise<void> {
    // No-op for mock
  }
}

describe('createAnalyticsService', () => {
  it('should create a service instance with the provided adapter', () => {
    // RED: Write test first - this should fail because createService doesn't exist yet
    
    const mockAdapter = new MockAnalyticsAdapter();
    const analytics = createAnalyticsService(mockAdapter);

    // Assert: service is created and can track events
    expect(analytics).toBeDefined();
    expect(analytics.trackPageView).toBeDefined();

    // Act: track a page view
    analytics.trackPageView('/test-page', 'visitor-123');

    // Assert: adapter received the event
    expect(mockAdapter.events).toHaveLength(1);
    expect(mockAdapter.events[0]).toMatchObject({
      type: 'page_view',
      page_path: '/test-page',
      visitor_id: 'visitor-123',
    });
  });

  it('should return the same instance (singleton pattern)', () => {
    // Arrange: create two instances with same adapter
    const mockAdapter = new MockAnalyticsAdapter();
    resetAnalyticsService(); // Ensure clean state

    // Act: create two instances
    const instance1 = createAnalyticsService(mockAdapter);
    const instance2 = createAnalyticsService(mockAdapter);

    // Assert: both are the same instance
    expect(instance1).toBe(instance2);
  });

  it('should track click events with correct data', () => {
    // Arrange
    const mockAdapter = new MockAnalyticsAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(mockAdapter);

    // Act: track a click event
    analytics.trackClick('button-click', '/home', 'visitor-456');

    // Assert: adapter received the click event
    expect(mockAdapter.events).toHaveLength(1);
    expect(mockAdapter.events[0]).toMatchObject({
      type: 'click',
      page_path: '/home',
      visitor_id: 'visitor-456',
      event_name: 'button-click',
    });
  });

  it('should track custom events with metadata', () => {
    // Arrange
    const mockAdapter = new MockAnalyticsAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(mockAdapter);

    // Act: track a custom event
    const metadata = { category: 'engagement', value: 42 };
    analytics.trackCustom('form_submit', metadata);

    // Assert: adapter received the custom event
    expect(mockAdapter.events).toHaveLength(1);
    expect(mockAdapter.events[0]).toMatchObject({
      type: 'custom',
      event_name: 'form_submit',
      metadata: metadata,
    });
  });

  it('should flush queued events when implemented', async () => {
    // Arrange
    const mockAdapter = new MockAnalyticsAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(mockAdapter);

    // Act: track some events
    analytics.trackPageView('/page1', 'visitor-1');
    analytics.trackClick('btn', '/page1', 'visitor-1');

    // Assert: events are tracked immediately (no queuing yet)
    expect(mockAdapter.events).toHaveLength(2);

    // Act: flush (no-op for now, but should not throw)
    await analytics.flush();

    // Assert: flush completed without error
    expect(true).toBe(true); // If we get here, flush didn't throw
  });

  it('should work with different adapters (adapter swapping)', () => {
    // Arrange: Create two different mock adapters
    const mockAdapter1 = new MockAnalyticsAdapter();
    const mockAdapter2 = new MockAnalyticsAdapter();
    
    // Act & Assert: First adapter
    resetAnalyticsService();
    const analytics1 = createAnalyticsService(mockAdapter1);
    analytics1.trackPageView('/page1', 'visitor-1');
    expect(mockAdapter1.events).toHaveLength(1);
    expect(mockAdapter2.events).toHaveLength(0); // Second adapter not used

    // Note: Once singleton is set, it stays with first adapter
    // This is expected behavior - singleton pattern
  });

  it('should pass visitor ID correctly to trackPageView and trackClick', () => {
    // Arrange
    const mockAdapter = new MockAnalyticsAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(mockAdapter);

    // Act: track events with specific visitor ID
    analytics.trackPageView('/page1', 'visitor-123');
    analytics.trackClick('btn', '/page1', 'visitor-123');

    // Assert: events have the correct visitor ID
    expect(mockAdapter.events).toHaveLength(2);
    expect(mockAdapter.events[0].visitor_id).toBe('visitor-123');
    expect(mockAdapter.events[1].visitor_id).toBe('visitor-123');
  });

  it('should handle errors gracefully (non-blocking)', () => {
    // Arrange: Create adapter that throws error
    class ErrorAdapter implements AnalyticsService {
      trackPageView(): void {
        throw new Error('Simulated error');
      }
      trackClick(): void {
        throw new Error('Simulated error');
      }
      trackCustom(): void {
        throw new Error('Simulated error');
      }
      async flush(): Promise<void> {}
    }

    const errorAdapter = new ErrorAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(errorAdapter);

    // Act & Assert: Should not throw
    expect(() => analytics.trackPageView('/page', 'visitor')).not.toThrow();
    expect(() => analytics.trackClick('btn', '/page', 'visitor')).not.toThrow();
    expect(() => analytics.trackCustom('event', {})).not.toThrow();
  });
});

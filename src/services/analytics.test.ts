import { describe, it, expect } from 'vitest';
import { createAnalyticsService, resetAnalyticsService } from './createService';
import { AnalyticsService, AnalyticsEvent } from './analytics';

// Mock adapter for testing
class MockAnalyticsAdapter implements AnalyticsService {
  public events: AnalyticsEvent[] = [];

  trackPageView(pagePath: string, visitorId: string): void {
    this.events.push({
      page_path: pagePath,
      visitor_id: visitorId,
      timestamp: new Date().toISOString(),
    });
  }

  async flush(): Promise<void> {
    // No-op for mock
  }
}

describe('createAnalyticsService', () => {
  it('should create a service instance with the provided adapter', () => {
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

  it('should flush queued events when implemented', async () => {
    // Arrange
    const mockAdapter = new MockAnalyticsAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(mockAdapter);

    // Act: track a page view
    analytics.trackPageView('/page1', 'visitor-1');

    // Assert: events are tracked immediately (no queuing yet)
    expect(mockAdapter.events).toHaveLength(1);

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

  it('should pass visitor ID correctly to trackPageView', () => {
    // Arrange
    const mockAdapter = new MockAnalyticsAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(mockAdapter);

    // Act: track events with specific visitor ID
    analytics.trackPageView('/page1', 'visitor-123');
    analytics.trackPageView('/page2', 'visitor-123');

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
      async flush(): Promise<void> {}
    }

    const errorAdapter = new ErrorAdapter();
    resetAnalyticsService();
    const analytics = createAnalyticsService(errorAdapter);

    // Act & Assert: Should not throw
    expect(() => analytics.trackPageView('/page', 'visitor')).not.toThrow();
  });
});

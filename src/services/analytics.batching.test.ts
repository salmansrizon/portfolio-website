import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { insertMock, fromMock } = vi.hoisted(() => {
  const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const fromMock = vi.fn(() => ({ insert: insertMock }));
  return { insertMock, fromMock };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: fromMock },
}));

// Imported after the mock so the module under test picks up the mocked client.
import { SupabaseAnalyticsAdapter, FLUSH_INTERVAL_MS } from './analytics';

describe('SupabaseAnalyticsAdapter batching', () => {
  let adapter: SupabaseAnalyticsAdapter;

  beforeEach(() => {
    vi.useFakeTimers();
    insertMock.mockClear();
    fromMock.mockClear();
    adapter = new SupabaseAnalyticsAdapter();
  });

  afterEach(() => {
    adapter.destroy();
    vi.useRealTimers();
  });

  it('queues events instead of inserting immediately', () => {
    adapter.trackPageView('/home', 'visitor-1');

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('flush sends every queued event in a single batched insert', async () => {
    adapter.trackPageView('/home', 'visitor-1');
    adapter.trackClick('cta', '/home', 'visitor-1');
    await adapter.flush();

    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith([
      { page_path: '/home', visitor_id: 'visitor-1' },
      { page_path: '/home', visitor_id: 'visitor-1' },
    ]);
  });

  it('flush is a no-op when the queue is empty', async () => {
    await adapter.flush();

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('clears the queue after flushing, so a repeat flush does not resend', async () => {
    adapter.trackPageView('/home', 'visitor-1');
    await adapter.flush();
    await adapter.flush();

    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it('auto-flushes on the configured interval', async () => {
    adapter.trackPageView('/home', 'visitor-1');

    await vi.advanceTimersByTimeAsync(FLUSH_INTERVAL_MS);

    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it('flushes when the tab is backgrounded (visibilitychange -> hidden)', async () => {
    adapter.trackPageView('/home', 'visitor-1');

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  it('flushes on beforeunload so the final batch is not silently dropped', async () => {
    adapter.trackPageView('/home', 'visitor-1');

    window.dispatchEvent(new Event('beforeunload'));
    await vi.waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
  });

  it('destroy() stops further interval-driven flushes', async () => {
    adapter.trackPageView('/home', 'visitor-1');
    adapter.destroy();

    await vi.advanceTimersByTimeAsync(FLUSH_INTERVAL_MS * 2);

    expect(insertMock).not.toHaveBeenCalled();
  });
});

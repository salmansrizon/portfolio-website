import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBookingData } from './useBookingData';

// Tracer bullet test - test OBSERVABLE BEHAVIOR only
// We don't care if it uses repository, direct Supabase, or carrier pigeon
// We only care that: given no input, it returns the expected data shape

describe('useBookingData Hook - Behavioral Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // TRACER BULLET: Test what the hook returns
  it('should return sessionTypes as an array', () => {
    const { result } = renderHook(() => useBookingData(), { wrapper });
    
    // Behavior: must return sessionTypes array (empty or populated)
    expect(Array.isArray(result.current.sessionTypes)).toBe(true);
  });

  // VERTICAL SLICE: Add tests one at a time
  it('should return isLoading as a boolean', () => {
    const { result } = renderHook(() => useBookingData(), { wrapper });
    
    // Behavior: loading must be a boolean
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should return availabilitySettings with required fields', () => {
    const { result } = renderHook(() => useBookingData(), { wrapper });
    
    // Behavior: availabilitySettings must have weekdays and time_slots
    expect(result.current.availabilitySettings).toHaveProperty('available_weekdays');
    expect(result.current.availabilitySettings).toHaveProperty('time_slots');
    expect(Array.isArray(result.current.availabilitySettings.available_weekdays)).toBe(true);
    expect(Array.isArray(result.current.availabilitySettings.time_slots)).toBe(true);
  });

  it('should provide isDateUnavailable helper function', () => {
    const { result } = renderHook(() => useBookingData(), { wrapper });
    
    // Behavior: must provide helper functions for date checking
    expect(typeof result.current.isDateUnavailable).toBe('function');
  });

  it('should provide getAvailableTimeSlots helper function', () => {
    const { result } = renderHook(() => useBookingData(), { wrapper });
    
    // Behavior: must provide helper functions for time slot calculation
    expect(typeof result.current.getAvailableTimeSlots).toBe('function');
  });
});

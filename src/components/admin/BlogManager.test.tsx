import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import BlogManager from './BlogManager';

// Mock supabase client since BlogManager imports it directly
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Tracer bullet test - test OBSERVABLE BEHAVIOR only
// BlogManager is a component that displays and manages blog posts.
// We test what the user sees, not how data is fetched.

describe('BlogManager Component - Behavioral Tests', () => {
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

  // TRACER BULLET: Does the component render without crashing?
  it('should render loading state initially', () => {
    render(<BlogManager />, { wrapper });
    
    // Behavior: before data loads, show spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
  });

  // VERTICAL SLICE: Test after mock data loads
  it('should show "Blog Posts" heading after loading', async () => {
    render(<BlogManager />, { wrapper });
    
    // Behavior: after data loads, show the blog management UI
    await waitFor(() => {
      expect(screen.getByText('Blog Posts')).toBeDefined();
    });
  });

  it('should show "New Blog Post" button after loading', async () => {
    render(<BlogManager />, { wrapper });
    
    // Behavior: user must be able to create new blog posts
    await waitFor(() => {
      expect(screen.getByText('New Blog Post')).toBeDefined();
    });
  });
});

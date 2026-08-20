// Test setup file for Vitest
// Configures jsdom environment for React component tests

import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
// Extends expect *and* declares the matcher types. The old
// `expect.extend(matchers)` worked at runtime but left every
// toBeInTheDocument() a type error, since nothing widened Assertion.
import '@testing-library/jest-dom/vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    href: 'http://localhost:3000/',
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
  },
});

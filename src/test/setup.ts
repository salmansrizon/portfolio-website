import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom lacks matchMedia; components using next-themes / media queries need it.
// (Guarded: node-environment suites, e.g. the PGLite seed harness, have no window.)
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// Unmount React trees between tests so queries don't leak across cases.
afterEach(() => {
  cleanup();
});

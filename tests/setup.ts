import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { JSDOM } from "jsdom";
import ResizeObserver from "resize-observer-polyfill";
import { afterEach, vi } from "vitest";
import "vitest-axe/extend-expect";

const { window } = new JSDOM();

// ResizeObserver mock
vi.stubGlobal("ResizeObserver", ResizeObserver);
window.ResizeObserver = ResizeObserver;

// IntersectionObserver mock
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
window.IntersectionObserver = IntersectionObserverMock;

// Scroll Methods mock
window.Element.prototype.scrollTo = () => {};
window.Element.prototype.scrollIntoView = () => {};

// navigator mock
Object.defineProperty(window, "navigator", {
  value: {
    clipboard: {
      writeText: vi.fn(),
    },
  },
  writable: true,
});

afterEach(() => {
  cleanup();
});

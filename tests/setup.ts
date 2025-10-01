import "@testing-library/jest-dom/vitest";
import { JSDOM } from "jsdom";
import ResizeObserver from "resize-observer-polyfill";
import { vi } from "vitest";

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
window.Element.prototype.scrollTo = vi.fn();
window.Element.prototype.scrollIntoView = vi.fn();
global.Element.prototype.scrollTo = vi.fn();
global.Element.prototype.scrollIntoView = vi.fn();

// navigator mock
Object.defineProperty(window, "navigator", {
  value: {
    clipboard: {
      writeText: vi.fn(),
    },
  },
  writable: true,
});

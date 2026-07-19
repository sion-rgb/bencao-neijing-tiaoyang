import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

Object.defineProperty(window, "confirm", { writable: true, value: vi.fn(() => true) });
Object.defineProperty(window, "print", { writable: true, value: vi.fn() });

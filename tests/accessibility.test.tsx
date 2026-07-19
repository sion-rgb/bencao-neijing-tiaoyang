import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { APP_CONFIG } from "../src/config/app";
import { AppStateProvider } from "../src/state/AppState";
import { safeAnswers } from "./helpers";

describe("主要頁面鍵盤與語意操作", () => {
  it.each(["/", "/consent", "/safety", "/classics", "/guidelines", "/privacy"])("%s 的主要操作均為可聚焦原生控制", (route) => {
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify({ schemaVersion: APP_CONFIG.storageVersion, consent: true, safetyAnswers: safeAnswers, questionnaireAnswers: {}, currentStep: 0, updatedAt: new Date().toISOString() }));
    render(<MemoryRouter initialEntries={[route]}><AppStateProvider><App /></AppStateProvider></MemoryRouter>);
    expect(screen.getByRole("main")).toBeInTheDocument();
    const controls = [...document.querySelectorAll<HTMLElement>("a, button, input")];
    expect(controls.length).toBeGreaterThan(0);
    expect(controls.every((element) => element.tabIndex >= 0 && (element.textContent?.trim() || element.getAttribute("aria-label") || element.getAttribute("placeholder") || element.closest("label")?.textContent?.trim()))).toBe(true);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  HERO_WORDS,
  TypewriterWord,
} from "../../components/TypewriterWord.jsx";
import { HomePage } from "../../pages/HomePage.jsx";

describe("TypewriterWord", () => {
  it("starts on obsession", () => {
    render(<TypewriterWord />);
    expect(screen.getAllByText("obsession").length).toBeGreaterThan(0);
    expect(HERO_WORDS[0]).toBe("obsession");
    expect(HERO_WORDS).toEqual([
      "obsession",
      "precision",
      "patience",
      "care",
      "heart",
      "love",
      "warmth",
      "joy",
    ]);
  });

  it("stays on obsession when motion is reduced", () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({
      matches: String(query).includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    render(<TypewriterWord />);
    expect(screen.getByText("obsession")).toBeTruthy();
    window.matchMedia = original;
  });
});

describe("HomePage hero", () => {
  it("keeps Baked with and the rotating word in the heading", () => {
    render(<HomePage navigate={() => {}} add={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /baked with[\s\S]*obsession/i,
    );
  });
});

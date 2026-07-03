import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CategoryBadge } from "../category-badge";

describe("CategoryBadge", () => {
  it("uses the category as its label by default", () => {
    render(<CategoryBadge category="Web Development" />);
    expect(screen.getByText("Web Development")).toBeInTheDocument();
  });

  it("maps a web category to the series-web tone", () => {
    render(<CategoryBadge category="Web Development" />);
    expect(screen.getByText("Web Development").className).toContain("series-web");
  });

  it("maps a data category to the series-data tone", () => {
    render(<CategoryBadge category="Data & Analytics" />);
    expect(screen.getByText("Data & Analytics").className).toContain("series-data");
  });

  it("falls back to neutral for an unknown category", () => {
    render(<CategoryBadge category="Philosophy" />);
    expect(screen.getByText("Philosophy").className).toContain("text-muted-foreground");
  });

  it("honors an explicit tone override", () => {
    render(<CategoryBadge category="anything" tone="career" />);
    expect(screen.getByText("anything").className).toContain("series-career");
  });

  it("renders children over the category label", () => {
    render(<CategoryBadge category="Web Development">Custom</CategoryBadge>);
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("forwards a custom className", () => {
    render(<CategoryBadge category="Web Development" className="custom-x" />);
    expect(screen.getByText("Web Development").className).toContain("custom-x");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectionHeading } from "../section-heading";

describe("SectionHeading", () => {
  it("renders the title as a heading", () => {
    render(<SectionHeading title="Master new skills" />);
    expect(screen.getByRole("heading", { name: "Master new skills" })).toBeInTheDocument();
  });

  it("renders the eyebrow only when provided", () => {
    const { rerender } = render(<SectionHeading title="T" />);
    expect(screen.queryByText("Explore")).toBeNull();
    rerender(<SectionHeading eyebrow="Explore" title="T" />);
    expect(screen.getByText("Explore")).toBeInTheDocument();
  });

  it("renders the description only when provided", () => {
    const { rerender } = render(<SectionHeading title="T" />);
    expect(screen.queryByText("Some detail")).toBeNull();
    rerender(<SectionHeading title="T" description="Some detail" />);
    expect(screen.getByText("Some detail")).toBeInTheDocument();
  });

  it("renders an action slot", () => {
    render(<SectionHeading title="T" action={<button data-testid="cta">Go</button>} />);
    expect(screen.getByTestId("cta")).toBeInTheDocument();
  });

  it("forwards a custom className", () => {
    const { container } = render(<SectionHeading title="T" className="custom-x" />);
    expect((container.firstChild as HTMLElement).className).toContain("custom-x");
  });
});

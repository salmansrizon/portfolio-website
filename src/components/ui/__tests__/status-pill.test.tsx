import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusPill } from "../status-pill";

describe("StatusPill", () => {
  it("renders its children", () => {
    render(<StatusPill>Paid</StatusPill>);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("applies success tone classes", () => {
    render(<StatusPill tone="success">Paid</StatusPill>);
    const el = screen.getByText("Paid");
    expect(el.className).toContain("bg-success-soft");
    expect(el.className).toContain("text-success");
  });

  it("applies danger tone classes", () => {
    render(<StatusPill tone="danger">Failed</StatusPill>);
    expect(screen.getByText("Failed").className).toContain("text-danger");
  });

  it("defaults to the neutral tone", () => {
    render(<StatusPill>Draft</StatusPill>);
    expect(screen.getByText("Draft").className).toContain("text-muted-foreground");
  });

  it("renders a status dot when `dot` is set", () => {
    const { container } = render(
      <StatusPill dot tone="success">
        Live
      </StatusPill>
    );
    expect(container.querySelector(".rounded-full")).toBeTruthy();
  });

  it("forwards a custom className", () => {
    render(<StatusPill className="custom-x">X</StatusPill>);
    expect(screen.getByText("X").className).toContain("custom-x");
  });
});

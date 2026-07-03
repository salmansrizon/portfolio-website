import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GradientPanel } from "../gradient-panel";

describe("GradientPanel", () => {
  it("renders its children", () => {
    render(<GradientPanel>Hero content</GradientPanel>);
    expect(screen.getByText("Hero content")).toBeInTheDocument();
  });

  it("applies the brand gradient background", () => {
    const { container } = render(<GradientPanel>x</GradientPanel>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-gradient-brand");
  });

  it("has no glow by default", () => {
    const { container } = render(<GradientPanel>x</GradientPanel>);
    expect(container.querySelector("[data-glow]")).toBeNull();
  });

  it("renders the glow when enabled", () => {
    const { container } = render(<GradientPanel glow>x</GradientPanel>);
    expect(container.querySelector("[data-glow]")).toBeTruthy();
  });

  it("renders as a custom element via `as`", () => {
    const { container } = render(<GradientPanel as="section">x</GradientPanel>);
    expect(container.querySelector("section")).toBeTruthy();
  });

  it("forwards a custom className", () => {
    const { container } = render(<GradientPanel className="custom-x">x</GradientPanel>);
    expect((container.firstChild as HTMLElement).className).toContain("custom-x");
  });
});

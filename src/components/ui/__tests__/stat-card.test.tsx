import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "../stat-card";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Revenue" value="৳341K" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("৳341K")).toBeInTheDocument();
  });

  it("renders a numeric value", () => {
    render(<StatCard label="Enrollments" value={86} />);
    expect(screen.getByText("86")).toBeInTheDocument();
  });

  it("colors an upward delta with the success tone", () => {
    render(<StatCard label="Revenue" value="৳341K" delta="18%" deltaDirection="up" />);
    expect(screen.getByTestId("stat-delta").className).toContain("text-success");
  });

  it("colors a downward delta with the danger tone", () => {
    render(<StatCard label="Conversion" value="4.8%" delta="0.3pt" deltaDirection="down" />);
    expect(screen.getByTestId("stat-delta").className).toContain("text-danger");
  });

  it("omits the delta element when no delta is given", () => {
    render(<StatCard label="Students" value={612} />);
    expect(screen.queryByTestId("stat-delta")).toBeNull();
  });

  it("renders an icon when provided", () => {
    render(<StatCard label="Revenue" value="৳341K" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

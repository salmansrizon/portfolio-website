import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Navbar from "../Navbar";

const setup = () => render(
  <MemoryRouter>
    <Navbar />
  </MemoryRouter>
);

describe("Navbar (behavior preserved through reskin)", () => {
  it("renders the brand", () => {
    setup();
    expect(screen.getByText("Salman Sakib")).toBeInTheDocument();
  });

  it("renders the primary nav destinations", () => {
    setup();
    for (const label of ["Roadmaps", "All Courses", "Portfolio", "Blog"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps the Book Session CTA", () => {
    setup();
    expect(screen.getAllByText(/Book Session/i).length).toBeGreaterThanOrEqual(1);
  });

  it("toggles the mobile menu open (renders a second copy of the links)", () => {
    setup();
    const before = screen.getAllByText("Blog").length;
    fireEvent.click(screen.getByLabelText("Toggle menu"));
    expect(screen.getAllByText("Blog").length).toBeGreaterThan(before);
  });
});

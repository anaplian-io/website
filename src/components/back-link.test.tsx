import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it } from "vitest";
import { BackLink } from "./back-link.tsx";

it("offers a named link to the home page", () => {
  render(
    <MemoryRouter>
      <BackLink />
    </MemoryRouter>,
  );
  expect(screen.getByRole("link", { name: "Anaplian.io" })).toHaveAttribute("href", "/");
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, it } from "vitest";
import { NotFoundPage } from "./not-found-page.tsx";

it("explains the missing page and provides a way home", () => {
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole("heading", { name: "Page not found" })).toBeVisible();
  expect(screen.getByText("404")).toBeVisible();
  expect(screen.getByRole("link", { name: "Anaplian.io" })).toHaveAttribute("href", "/");
  expect(document.title).toBe("Page not found · Anaplian.io");
});

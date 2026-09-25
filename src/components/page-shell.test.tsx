import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { PageShell } from "./page-shell.tsx";

it("places composed page content inside the main landmark", () => {
  render(
    <PageShell>
      <h1>Example page</h1>
      <button>Continue</button>
    </PageShell>,
  );
  const main = within(screen.getByRole("main"));
  expect(main.getByRole("heading", { name: "Example page" })).toBeVisible();
  expect(main.getByRole("button", { name: "Continue" })).toBeVisible();
});

import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { SocialLinks } from "./social-links.tsx";

it("exposes named social links with the correct destinations", () => {
  render(<SocialLinks />);
  const navigation = within(screen.getByRole("navigation", { name: "Social profiles" }));
  expect(navigation.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/efortner",
  );
  expect(navigation.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/ethan-fortner-95566682",
  );
});

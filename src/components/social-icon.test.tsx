import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SocialIcon } from "./social-icon.tsx";

it.each(["github", "linkedin"] as const)(
  "keeps the %s icon decorative without changing its link name",
  (name) => {
    render(
      <a href="https://example.com" aria-label="Social profile">
        <SocialIcon name={name} />
      </a>,
    );
    const link = screen.getByRole("link", { name: "Social profile" });
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(link.querySelector("path")).toHaveAttribute("d", expect.stringMatching(/^M/));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  },
);

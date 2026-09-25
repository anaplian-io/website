import { act } from "@testing-library/react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("react-dom/client", { spy: true });

let root: Root | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
  vi.clearAllMocks();
  vi.resetModules();
});

it("mounts the application in the document root", async () => {
  const container = document.createElement("div");
  container.id = "app";
  document.body.append(container);
  await act(async () => {
    await import("./index.tsx");
  });
  root = vi.mocked(createRoot).mock.results[0]?.value;
  expect(createRoot).toHaveBeenCalledWith(container);
  expect(container).toHaveTextContent("Anaplian.io");
});

it("reports a missing application root", async () => {
  await expect(import("./index.tsx")).rejects.toThrow("Missing application root");
  expect(createRoot).not.toHaveBeenCalled();
});

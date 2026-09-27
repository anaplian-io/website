import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TaskPagination } from "./task-pagination.tsx";

const props = {
  hasMore: true,
  loading: false,
  error: "",
  disabled: false,
  onLoadMore: vi.fn().mockResolvedValue(undefined),
};

it("loads near the viewport and disconnects when loading or editing", () => {
  let intersect!: (entries: { isIntersecting: boolean }[]) => void;
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof intersect) {
        intersect = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  const onLoadMore = vi.fn().mockResolvedValue(undefined);
  const { rerender } = render(<TaskPagination {...props} onLoadMore={onLoadMore} />);
  expect(observe).toHaveBeenCalled();
  act(() => intersect([{ isIntersecting: false }]));
  expect(onLoadMore).not.toHaveBeenCalled();
  act(() => intersect([{ isIntersecting: true }]));
  expect(onLoadMore).toHaveBeenCalledTimes(1);
  rerender(<TaskPagination {...props} loading />);
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent("Loading more tasks");
  expect(screen.getByRole("button")).toBeDisabled();
  rerender(<TaskPagination {...props} disabled />);
  expect(screen.getByRole("button")).toBeDisabled();
  rerender(<TaskPagination {...props} hasMore={false} />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("offers manual loading without observers and a retry after failure", async () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const onLoadMore = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  const { rerender } = render(<TaskPagination {...props} onLoadMore={onLoadMore} />);
  await user.click(screen.getByRole("button", { name: "Load more tasks" }));
  expect(onLoadMore).toHaveBeenCalledTimes(1);
  rerender(<TaskPagination {...props} error="Read failed" onLoadMore={onLoadMore} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Read failed");
  await user.click(screen.getByRole("button", { name: "Retry loading tasks" }));
  expect(onLoadMore).toHaveBeenCalledTimes(2);
});

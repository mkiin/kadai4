import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cards/")({
  component: () => <div className="">hello</div>,
});

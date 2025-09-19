import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cards/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/cards/$id"!</div>;
}

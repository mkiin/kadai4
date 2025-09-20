import { createFileRoute } from "@tanstack/react-router";
import { userQueryOptions } from "./-api/user-query";
import { UserCard } from "./-components/user-card";

export const Route = createFileRoute("/cards/$id")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.id)),
  component: RouteComponent,
  pendingComponent: () => <>loading...</>,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return (
    <div>
      <UserCard id={id} />
    </div>
  );
}

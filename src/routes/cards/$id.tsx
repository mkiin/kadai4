import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { userQueryOptions } from "./-api/user-query";

export const Route = createFileRoute("/cards/$id")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.id)),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: user } = useSuspenseQuery(userQueryOptions(id));

  return (
    <div>
      <p>{user.name}</p>
      <p>{user.description}</p>
      <div>
        <p>スキル</p>
        {user.user_skill.map((skills) => (
          <p key={skills.skills.skill_id}>{skills.skills.name}</p>
        ))}
      </div>
      <p>GitHub: {user.github_id}</p>
      <p>Qiita: {user.qiita_id}</p>
      <p>X: {user.x_id}</p>
    </div>
  );
}

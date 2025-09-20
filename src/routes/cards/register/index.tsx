import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserRegisterForm } from "@/routes/cards/-components/user-register-form";
import { skillsOptions } from "../-api/skill-query";

export const Route = createFileRoute("/cards/register/")({
  component: UserRegisterPage,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(skillsOptions());
  },
  pendingComponent: () => <div>スキルデータ取得中...</div>,
});

function UserRegisterPage() {
  const { data: skills } = useSuspenseQuery(skillsOptions());

  return (
    <div>
      <div>新規名刺登録</div>
      <UserRegisterForm skillsCollection={skills} />
    </div>
  );
}

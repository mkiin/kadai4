import { createFileRoute } from "@tanstack/react-router";
import "../App.css";
import { Button, Input } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userIdsQueryOptions } from "./cards/-api/user-query";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(userIdsQueryOptions());
  },
  pendingComponent: () => <div>ユーザーIDを取得中</div>,
  component: App,
});

function App() {
  const { data: userIds } = useSuspenseQuery(userIdsQueryOptions());

  return (
    <div className="App">
      <Input />
      <Button>名刺に移動</Button>
    </div>
  );
}

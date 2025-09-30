import { TanstackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

// 開発ツールを表示すべきかを判定する関数
const shouldShowDevtools = () => {
  // テスト環境では無効
  if (import.meta.env.TEST) {
    return false;
  }

  // 本番環境では無効
  if (import.meta.env.PROD) {
    return false;
  }

  // 開発環境でのみ有効
  return import.meta.env.DEV;
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <>
      <Outlet />
      {shouldShowDevtools() && (
        <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "Tanstack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  ),
});

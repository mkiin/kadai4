// file-route-utils.tsx
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { type RenderOptions, render } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";

/**
 * テスト用のQueryClientを作成
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface TestProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

const TestProvider: React.FC<TestProviderProps> = ({
  children,
  queryClient,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
};

interface CreateTestRouterOptions {
  initialLocation?: string;
  queryClient?: QueryClient;
}

export function createTestRouter({
  initialLocation = "/",
  queryClient,
}: CreateTestRouterOptions = {}) {
  // queryClientが渡されない場合は新規作成
  const client = queryClient ?? createTestQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient: client },
    defaultPendingMs: 1,
    history: createMemoryHistory({
      initialEntries: [initialLocation],
    }),
    Wrap: ({ children }) => {
      return <TestProvider queryClient={client}>{children}</TestProvider>;
    },
  });

  return router;
}

interface RenderRouterOptions extends Omit<RenderOptions, "wrapper"> {
  initialLocation?: string;
  queryClient?: QueryClient;
}

export function renderRouter({
  initialLocation = "/",
  queryClient,
  ...renderOptions
}: RenderRouterOptions = {}) {
  const router = createTestRouter({ initialLocation, queryClient });

  const result = render(<RouterProvider router={router} />, renderOptions);

  return {
    ...result,
    router,
  };
}

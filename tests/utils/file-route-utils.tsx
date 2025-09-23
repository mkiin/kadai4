import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { type RenderOptions, render } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

const queryClient = makeQueryClient();

const TestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
};

export function createTestRouter(initialLocation = "/") {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({
      initialEntries: [initialLocation],
    }),
    Wrap: ({ children }) => {
      return <TestProvider>{children}</TestProvider>;
    },
  });
  return router;
}

interface RenderRouterOptions extends Omit<RenderOptions, "wrapper"> {
  initialLocation?: string;
}

export function renderRouter({
  initialLocation = "/",
  ...renderOptions
}: RenderRouterOptions = {}) {
  const router = createTestRouter(initialLocation);

  const result = render(<RouterProvider router={router} />, renderOptions);

  return {
    ...result,
    router,
  };
}

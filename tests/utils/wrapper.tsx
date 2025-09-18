import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";

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

const TestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = makeQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const Wrapper: React.FC<{ children : React.ReactNode }> = ({
  children
}) => {
  return <TestProvider>{children}</TestProvider>
}
export default Wrapper;
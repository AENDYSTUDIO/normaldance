"use client";

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setContext } from "@apollo/client/link/context";
import { useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: (failureCount, error: any) => {
              if (error?.status === 404) return false;
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  const [apolloClient] = useState(() => {
    const httpLink = createHttpLink({
      uri: "/api/graphql", // GraphQL endpoint
    });

    const authLink = setContext((_, { headers }) => {
      // Add auth headers here if needed
      return {
        headers: {
          ...headers,
        },
      };
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </QueryClientProvider>
  );
}

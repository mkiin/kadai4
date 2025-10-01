import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { userIdsQueryOptions } from "./cards/-api/user-query";
import { UserIdSearchCombobox } from "./cards/-components/user-id-search-combobox";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(userIdsQueryOptions());
  },
  pendingComponent: () => (
    <Container maxW="container.md" centerContent py="10">
      <Text color="fg.muted">ユーザーIDを取得中...</Text>
    </Container>
  ),
  component: App,
});

function App() {
  const { data: userIds } = useSuspenseQuery(userIdsQueryOptions());

  return (
    <Box bg="bg.muted" minH="100vh">
      <Container
        maxW="container.md"
        py={{ base: 6, md: 12 }}
        px={{ base: 4, sm: 6 }}
      >
        <VStack align="center">
          <Box
            bg="bg.panel"
            p={{ base: 6, sm: 8 }}
            borderRadius="lg"
            shadow="md"
            mx={{ base: -2, sm: 0 }}
            width="full"
            maxW={{ base: "full", sm: "480px" }}
          >
            <VStack gap={{ base: 6, sm: 8 }} align="stretch">
              <Box textAlign="center">
                <Heading
                  size={{ base: "2xl", sm: "3xl" }}
                  mb={{ base: 3, sm: 4 }}
                  color="fg"
                  fontWeight="extrabold"
                >
                  名刺検索
                </Heading>
                <Text
                  color="fg.muted"
                  fontSize={{ base: "md", sm: "lg" }}
                  lineHeight="1.6"
                  mb={{ base: 4, sm: 6 }}
                  fontWeight="semibold"
                >
                  ユーザーIDから名刺情報を検索できます
                </Text>
              </Box>

              <UserIdSearchCombobox userIds={userIds} />

              <Box textAlign="center" width="full">
                <Text
                  fontSize={{ base: "md", sm: "lg" }}
                  color="fg.muted"
                  mb={{ base: 3, sm: 4 }}
                  fontWeight="bold"
                >
                  または
                </Text>
                <Link to="/cards/register" style={{ width: "100%" }}>
                  <Button
                    // variant="subtle"
                    colorPalette="teal"
                    size={{ base: "lg", sm: "xl" }}
                    width="full"
                    height={{ base: "12", sm: "14" }}
                    fontSize={{ base: "lg", sm: "xl" }}
                    fontWeight="bold"
                  >
                    新しい名刺を登録する
                  </Button>
                </Link>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

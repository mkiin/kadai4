import { Box, Button, Center, Container, Text, VStack } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { userQueryOptions } from "./-api/user-query";
import { UserCard } from "./-components/user-card";

export const Route = createFileRoute("/cards/$id")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.id)),
  component: CardDetailPage,
  pendingComponent: () => (
    <Container maxW="container.md" centerContent py="10">
      <Text color="fg.muted">名刺情報を読み込み中...</Text>
    </Container>
  ),
});

function CardDetailPage() {
  const { id } = Route.useParams();
  const { data: user } = useSuspenseQuery(userQueryOptions(id));

  return (
    <Box bg="bg.muted" minH="100vh">
      <Container
        maxW="container.lg"
        py={{ base: 4, sm: 6, md: 8 }}
        px={{ base: 3, sm: 4, md: 6 }}
      >
        <VStack gap={{ base: 6, sm: 8 }} align="center">
          <Center width="full">
            <UserCard user={user} />
          </Center>

          <VStack
            gap={{ base: 2, sm: 3 }}
            width="full"
            maxW={{ base: "full", sm: "sm" }}
            px={{ base: 2, sm: 0 }}
          >
            <Link to="/" style={{ width: "100%" }}>
              <Button
                width="full"
                colorPalette="teal"
                size={{ base: "lg", sm: "xl" }}
                height={{ base: "12", sm: "14" }}
                fontSize={{ base: "lg", sm: "xl" }}
                fontWeight="bold"
              >
                ユーザー検索に戻る
              </Button>
            </Link>
            <Link to="/cards/register" style={{ width: "100%" }}>
              <Button
                width="full"
                colorPalette="blue"
                size={{ base: "lg", sm: "xl" }}
                height={{ base: "12", sm: "14" }}
                fontSize={{ base: "lg", sm: "xl" }}
                fontWeight="bold"
              >
                新しい名刺を登録
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

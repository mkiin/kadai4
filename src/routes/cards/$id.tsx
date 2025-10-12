import { Box, Button, Container, Text, VStack } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ColorModeButton } from "@/components/ui/color-mode";
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
    <Box bg="bg.muted" minH="100vh" position="relative">
      <Box
        position="absolute"
        top={{ base: 3 }}
        right={{ base: 3 }}
        zIndex="10"
      >
        <ColorModeButton variant={"subtle"} />
      </Box>
      <Container
        maxW="container.md"
        py={{ base: 6 }}
        px={{ base: 3 }}
        pt={{ base: 16 }}
      >
        <VStack gap={{ base: 8 }} align="center">
          <UserCard user={user} />

          <VStack
            gap={{ base: 3 }}
            width="full"
            maxW={{ base: "440px" }}
            px={{ base: 0 }}
          >
            <Link to="/cards/register" style={{ width: "100%" }}>
              <Button
                width="full"
                color={{ base: "white" }}
                bg={{ _light: "blue.400", _dark: "blue.600" }}
                _hover={{ bg: { _light: "blue.500", _dark: "blue.500" } }}
                size={{ base: "lg", sm: "xl" }}
                height={{ base: "12", sm: "14" }}
                fontSize={{ base: "lg", sm: "xl" }}
                fontWeight="bold"
              >
                新しい名刺を登録
              </Button>
            </Link>
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
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

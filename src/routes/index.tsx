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
import { ColorModeButton } from "@/components/ui/color-mode";
import { getAllUsersOption } from "./cards/-api/user-query";
import { UserNameSearchCombobox } from "./cards/-components/user-name-search-combobox";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getAllUsersOption());
  },
  pendingComponent: () => (
    <Container maxW="container.md" centerContent py="10">
      <Text color="fg.muted">ユーザーIDを取得中...</Text>
    </Container>
  ),
  component: App,
});

function App() {
  const { data: allUsers } = useSuspenseQuery(getAllUsersOption());

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
        <VStack align="center">
          <Box
            bg="bg.card"
            p={{ base: 6, sm: 8 }}
            borderRadius="lg"
            shadow="md"
            mx={{ base: 0, sm: 0 }}
            width="full"
            maxW={{ base: "440px" }}
          >
            <VStack gap={{ base: 6, sm: 8 }} align="stretch">
              <Box textAlign="center">
                <Heading
                  size={{ base: "3xl" }}
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
                  名前から名刺情報を検索できます
                </Text>
              </Box>

              <UserNameSearchCombobox allUsers={allUsers} />

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
                    size={{ base: "lg", sm: "xl" }}
                    width="full"
                    height={{ base: "12", sm: "14" }}
                    fontSize={{ base: "lg", sm: "xl" }}
                    fontWeight="bold"
                    color={{ _light: "bg", _dark: "fg.muted" }}
                    bg={{ _light: "teal.400", _dark: "teal.600" }}
                    _hover={{ bg: { _light: "teal.500", _dark: "teal.500" } }}
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

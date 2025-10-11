import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { UserRegisterForm } from "@/routes/cards/-components/user-register-form";
import { skillsOptions } from "../-api/skill-query";

export const Route = createFileRoute("/cards/register/")({
  component: UserRegisterPage,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(skillsOptions());
  },
  pendingComponent: () => (
    <Container maxW="container.md" centerContent py="10">
      <Text color="fg.muted">スキルデータ取得中...</Text>
    </Container>
  ),
});

function UserRegisterPage() {
  const { data: skills } = useSuspenseQuery(skillsOptions());

  return (
    <Box bg="bg.muted" minH="100vh">
      <Container
        maxW={{ base: "container.md", md: "container.xl" }}
        py={{ base: 4, sm: 6, md: 4 }}
        px={{ base: 3, sm: 4, md: 6 }}
      >
        <VStack gap={{ base: 4, sm: 6, md: 4 }} align="stretch">
          <Box textAlign="center">
            <HStack
              justify="space-between"
              align="center"
              mb={{ base: 2, sm: 4 }}
            >
              <Link to="/">
                <Button
                  variant="ghost"
                  size={{ base: "sm", sm: "md" }}
                  colorPalette="blue"
                  color={{ _light: "blue.600", _dark: "blue.200" }}
                  _hover={{
                    bg: { _light: "blue.50", _dark: "blue.800" },
                  }}
                >
                  ← ホーム
                </Button>
              </Link>
              <Box flex="1" />
            </HStack>
            <Heading
              size={{ base: "2xl", sm: "3xl", md: "2xl" }}
              mb={{ base: 2, sm: 3, md: 2 }}
              lineHeight="1.2"
              color={{ _light: "gray.900", _dark: "white" }}
            >
              新規名刺登録
            </Heading>
          </Box>
          <Box
            bg="bg.card"
            p={{ base: 4, sm: 6, md: 6 }}
            borderRadius="lg"
            shadow="sm"
            mx="auto"
            maxW="740px"
            width="full"
          >
            <UserRegisterForm skillsCollection={skills} />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

import {
  Badge,
  Box,
  Card,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuExternalLink, LuGithub, LuTwitter } from "react-icons/lu";
import type { ReturnGetUserById } from "../-api/user";
import { mediaUrl } from "../-lib/constants";

type UserCardProps = {
  user: ReturnGetUserById;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <Card.Root
      width={{ base: "full", sm: "360px" }}
      maxW={{ base: "100%", sm: "360px" }}
      variant="elevated"
      shadow="md"
      mx={{ base: 2, sm: 0 }}
    >
      <Card.Body gap={{ base: "4", sm: "5" }} p={{ base: 4, sm: 6 }}>
        {/* ユーザー名 */}
        <Stack gap={{ base: 2, sm: 3 }}>
          <Text
            fontSize={{ base: "xl", sm: "2xl" }}
            fontWeight="bold"
            color="fg"
            lineHeight="1.2"
            wordBreak="break-word"
          >
            {user.name}
          </Text>
        </Stack>

        {/* 自己紹介 */}
        <Stack gap={{ base: 1, sm: 2 }}>
          <Text
            fontSize={{ base: "xs", sm: "sm" }}
            fontWeight="semibold"
            color="fg.subtle"
          >
            自己紹介
          </Text>
          <Box
            bg="bg.subtle"
            p={{ base: 2, sm: 3 }}
            borderRadius="md"
            borderLeft="3px solid"
            borderLeftColor="blue.400"
          >
            <Text
              fontSize={{ base: "xs", sm: "sm" }}
              color="fg"
              lineHeight="1.6"
              wordBreak="break-word"
            >
              {user.description}
            </Text>
          </Box>
        </Stack>

        {/* 好きな技術 */}
        {user.user_skill && user.user_skill.length > 0 && (
          <Stack gap={{ base: 1, sm: 2 }}>
            <Text
              fontSize={{ base: "xs", sm: "sm" }}
              fontWeight="semibold"
              color="fg.subtle"
            >
              好きな技術
            </Text>
            <HStack wrap="wrap" gap={{ base: 1, sm: 2 }}>
              {user.user_skill.map((skill) => (
                <Badge
                  key={skill.skills.skill_id || skill.skills.name}
                  colorPalette="teal"
                  variant="subtle"
                  size={{ base: "sm", sm: "md" }}
                  fontSize={{ base: "2xs", sm: "xs" }}
                >
                  {skill.skills.name || skill.skills.skill_id}
                </Badge>
              ))}
            </HStack>
          </Stack>
        )}
      </Card.Body>

      {/* ソーシャルリンク */}
      {(user.github_id || user.qiita_id || user.x_id) && (
        <Card.Footer
          justifyContent="center"
          pt={{ base: 2, sm: 3 }}
          pb={{ base: 2, sm: 3 }}
          borderTop="1px solid"
          borderColor="border.muted"
        >
          <HStack gap={{ base: 2, sm: 3 }}>
            {user.github_id && (
              <Link
                href={`${mediaUrl.gitHubUrl}/${user.github_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton
                  variant="ghost"
                  size={{ base: "lg", sm: "xl" }}
                  aria-label="GitHub"
                  color="fg"
                  _hover={{ color: "fg", bg: "bg.subtle" }}
                  minWidth={{ base: "48px", sm: "52px" }}
                  height={{ base: "48px", sm: "52px" }}
                >
                  <LuGithub />
                </IconButton>
              </Link>
            )}

            {user.qiita_id && (
              <Link
                href={`${mediaUrl.qiitaUrl}/${user.qiita_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton
                  variant="ghost"
                  size={{ base: "lg", sm: "xl" }}
                  aria-label="Qiita"
                  color="fg"
                  _hover={{ color: "fg", bg: "bg.subtle" }}
                  minWidth={{ base: "48px", sm: "52px" }}
                  height={{ base: "48px", sm: "52px" }}
                >
                  <LuExternalLink />
                </IconButton>
              </Link>
            )}

            {user.x_id && (
              <Link
                href={`${mediaUrl.xUrl}/${user.x_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton
                  variant="ghost"
                  size={{ base: "lg", sm: "xl" }}
                  aria-label="X (Twitter)"
                  color="fg"
                  _hover={{ color: "fg", bg: "bg.subtle" }}
                  minWidth={{ base: "48px", sm: "52px" }}
                  height={{ base: "48px", sm: "52px" }}
                >
                  <LuTwitter />
                </IconButton>
              </Link>
            )}
          </HStack>
        </Card.Footer>
      )}
    </Card.Root>
  );
}

import { Box, Card, Icon, Link, Stack, Text } from "@chakra-ui/react";
import { FaSquareGithub, FaSquareXTwitter } from "react-icons/fa6";
import { SiQiita } from "react-icons/si";
import type { ReturnGetUserById } from "../-api/user";
import { mediaUrl } from "../-lib/constants";

type UserCardProps = {
  user: ReturnGetUserById;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <Card.Root
      width={{ base: "full" }}
      maxWidth={{ base: "440px" }}
      variant="elevated"
      shadow="md"
      bg={"bg.card"}
    >
      <Card.Body gap={{ base: "4", sm: "5" }} p={{ base: 4, sm: 6 }}>
        {/* ユーザー名 */}
        <Stack gap={{ base: 2, sm: 3 }}>
          <Text
            fontSize={{ base: "3xl", sm: "4xl" }}
            fontWeight="extrabold"
            color="fg"
            lineHeight="1.2"
            wordBreak="break-word"
          >
            {user.name}
          </Text>
        </Stack>

        {/* 自己紹介 */}
        <Stack gap={{ base: 1, sm: 2 }}>
          <Text fontSize={{ base: "lg" }} fontWeight="bold">
            自己紹介
          </Text>
          <Box bg="bg.muted" p={{ base: 2, sm: 3 }} borderRadius="md">
            <Text
              fontSize={{ base: "md" }}
              fontWeight="medium"
              color="fg"
              lineHeight="1.6"
              wordBreak="break-word"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <>
              dangerouslySetInnerHTML={{ __html: user.description }}
            />
          </Box>
        </Stack>

        {/* 好きな技術 */}
        {user.user_skill && user.user_skill.length > 0 && (
          <Stack gap={{ base: 1, sm: 2 }}>
            <Text fontSize={{ base: "lg" }} fontWeight="bold">
              好きな技術
            </Text>
            <Text
              fontSize={{ base: "lg", sm: "xl" }}
              fontWeight="bold"
              color="teal.600"
              _dark={{ color: "teal.400" }}
            >
              {user.user_skill[0].skills.name ||
                user.user_skill[0].skills.skill_id}
            </Text>
          </Stack>
        )}
      </Card.Body>

      {/* ソーシャルリンク */}
      {(user.github_id || user.qiita_id || user.x_id) && (
        <Card.Footer
          justifyContent="space-between"
          pt={{ base: 2, sm: 3 }}
          pb={{ base: 2, sm: 3 }}
          borderTop="1px solid"
          borderColor="border.muted"
          px={{ base: 4, sm: 6 }}
        >
          {user.github_id && (
            <Link
              href={`${mediaUrl.gitHubUrl}/${user.github_id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="github"
            >
              <Icon fontSize="4xl" _hover={{ opacity: 0.8 }} cursor="pointer">
                <FaSquareGithub />
              </Icon>
            </Link>
          )}

          {user.qiita_id && (
            <Link
              href={`${mediaUrl.qiitaUrl}/${user.qiita_id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="qiita"
            >
              <Icon fontSize="4xl" _hover={{ opacity: 0.8 }} cursor="pointer">
                <SiQiita />
              </Icon>
            </Link>
          )}

          {user.x_id && (
            <Link
              href={`${mediaUrl.xUrl}/${user.x_id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="twitter"
            >
              <Icon fontSize="4xl" _hover={{ opacity: 0.8 }} cursor="pointer">
                <FaSquareXTwitter />
              </Icon>
            </Link>
          )}
        </Card.Footer>
      )}
    </Card.Root>
  );
}

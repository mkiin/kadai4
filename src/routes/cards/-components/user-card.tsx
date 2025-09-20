import { Card, HStack, IconButton, Link, Stack, Text } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LuExternalLink, LuGithub, LuTwitter } from "react-icons/lu";
import { userQueryOptions } from "@/routes/cards/-api/user-query";
import { mediaUrl } from "../-lib/constants";

export function UserCard({ id }: { id: string }) {
  const { data: user } = useSuspenseQuery(userQueryOptions(id));

  return (
    <Card.Root width="320px" variant="outline">
      <Card.Body gap="4">
        {/* ユーザー名 */}
        <Text fontSize="xl" fontWeight="bold" color="fg">
          {user.name}
        </Text>

        {/* 自己紹介 */}
        <Stack gap="1">
          <Text fontSize="sm" fontWeight="medium" color="fg.muted">
            自己紹介
          </Text>
          <Text fontSize="sm" color="fg.muted" lineHeight="1.5">
            {user.description}
          </Text>
        </Stack>

        {/* 好きな技術 */}
        {user.user_skill && user.user_skill.length > 0 && (
          <Stack gap="2">
            <Text fontSize="sm" fontWeight="medium" color="fg.muted">
              好きな技術
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {user.user_skill
                .map((skill) => skill.skills.name || skill.skills.skill_id)
                .join(", ")}
            </Text>
          </Stack>
        )}
      </Card.Body>

      {/* ソーシャルリンク */}
      {(user.github_id || user.qiita_id || user.x_id) && (
        <Card.Footer justifyContent="center" pt="2">
          <HStack gap="2">
            {user.github_id && (
              <Link
                href={`${mediaUrl.gitHubUrl}/${user.github_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="GitHub"
                  color="fg.muted"
                  _hover={{ color: "fg" }}
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
                  size="sm"
                  aria-label="Qiita"
                  color="fg.muted"
                  _hover={{ color: "fg" }}
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
                  size="sm"
                  aria-label="X (Twitter)"
                  color="fg.muted"
                  _hover={{ color: "fg" }}
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

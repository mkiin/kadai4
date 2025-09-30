import {
  Alert,
  Box,
  Button,
  createListCollection,
  Field,
  Grid,
  GridItem,
  Heading,
  Input,
  Portal,
  Select,
  Separator,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUserRegisterMutation } from "../-api/user-query";

type UserRegisterFormData = {
  likeWord: string;
  name: string;
  desctiption: string;
  skills: string[];
  githubId?: string;
  qiitaId?: string;
  xId?: string;
};

type SkillData = {
  skillId: number;
  name: string;
};

type UserRegisterFormProps = {
  skillsCollection: SkillData[];
};

export function UserRegisterForm({ skillsCollection }: UserRegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<UserRegisterFormData>({
    mode: "onChange",
    defaultValues: {
      likeWord: "",
      name: "",
      desctiption: "",
      skills: [],
    },
  });

  const navigate = useNavigate();

  const { mutateAsync: createUser, isPending: creating } =
    useUserRegisterMutation(
      () => {
        navigate({ to: "/" });
      },
      (errorMessage: string) => {
        setRegisterError(errorMessage);
      },
    );

  const [registerError, setRegisterError] = useState<string | null>(null);

  const onSubmit = async (data: UserRegisterFormData) => {
    createUser(data);
  };

  // createListCollectionでコレクションを作成
  const skillCollection = useMemo(
    () =>
      createListCollection({
        items: skillsCollection,
        itemToString: (item) => item.name,
        itemToValue: (item) => item.skillId.toString(),
      }),
    [skillsCollection],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={{ base: "6", sm: "8" }}>
        {/* エラーメッセージの表示 */}
        {registerError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>エラーが発生しました</Alert.Title>
              <Alert.Description>{registerError}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
        {/* 基本情報セクション */}
        <Box>
          <Heading
            size={{ base: "sm", sm: "md" }}
            mb={{ base: 4, sm: 6 }}
            fontSize={{ base: "lg", sm: "xl" }}
          >
            基本情報
          </Heading>
          <Stack gap={{ base: "4", sm: "6" }}>
            {/* すきな単語 */}
            <Field.Root invalid={!!errors.likeWord}>
              <Field.Label
                htmlFor={"likeWord"}
                fontWeight="medium"
                fontSize={{ base: "sm", sm: "md" }}
                mb={{ base: 1, sm: 2 }}
              >
                好きな単語
              </Field.Label>
              <Input
                id="likeWord"
                placeholder="Apple"
                fontSize={{ base: "16px", sm: "md" }}
                height={{ base: "12" }}
                {...register("likeWord", {
                  required: "内容の入力は必須です",
                  minLength: {
                    value: 1,
                    message: "1文字以上入力してください",
                  },
                  maxLength: {
                    value: 20,
                    message: "20文字以下で入力してください",
                  },
                })}
              />
              <Field.ErrorText>{errors.likeWord?.message}</Field.ErrorText>
            </Field.Root>

            {/* お名前 */}
            <Field.Root invalid={!!errors.name}>
              <Field.Label
                htmlFor={"name"}
                fontWeight="medium"
                fontSize={{ base: "sm", sm: "md" }}
                mb={{ base: 1, sm: 2 }}
              >
                名前
              </Field.Label>
              <Input
                id="name"
                placeholder="John Doe"
                fontSize={{ base: "16px", sm: "md" }}
                height={{ base: "12" }}
                {...register("name", {
                  required: "内容の入力は必須です",
                  minLength: {
                    value: 1,
                    message: "1文字以上入力してください",
                  },
                  maxLength: {
                    value: 20,
                    message: "20文字以下で入力してください",
                  },
                })}
              />
              <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
            </Field.Root>

            {/* 自己紹介 */}
            <Field.Root invalid={!!errors.desctiption}>
              <Field.Label
                htmlFor={"desctiption"}
                fontWeight="medium"
                fontSize={{ base: "sm", sm: "md" }}
                mb={{ base: 1, sm: 2 }}
              >
                自己紹介
              </Field.Label>
              <Textarea
                id="desctiption"
                placeholder="僕の名前はJohn Doeです"
                resize="vertical"
                minH={{ base: "80px", sm: "100px" }}
                fontSize={{ base: "16px", sm: "md" }}
                {...register("desctiption", {
                  required: "内容の入力は必須です",
                  minLength: {
                    value: 1,
                    message: "1文字以上入力してください",
                  },
                  maxLength: {
                    value: 20,
                    message: "20文字以下で入力してください",
                  },
                })}
              />
              <Field.ErrorText>{errors.desctiption?.message}</Field.ErrorText>
            </Field.Root>

            {/* 好きな技術 */}
            <Field.Root invalid={!!errors.skills}>
              <Field.Label
                fontWeight="medium"
                fontSize={{ base: "sm", sm: "md" }}
                mb={{ base: 1, sm: 2 }}
              >
                好きな技術
              </Field.Label>
              <Controller
                control={control}
                name="skills"
                rules={{
                  validate: (value) =>
                    value.length <= 3 || "技術は3つまで選択可能です",
                }}
                render={({ field }) => (
                  <Select.Root
                    multiple
                    collection={skillCollection}
                    value={field.value}
                    onValueChange={({ value }) => field.onChange(value)}
                    onInteractOutside={() => field.onBlur()}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="技術を選択してください（最大3つ）" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {skillCollection.items.map((skill) => (
                            <Select.Item item={skill} key={skill.skillId}>
                              {skill.name}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                )}
              />
              <Field.ErrorText>{errors.skills?.message}</Field.ErrorText>
            </Field.Root>
          </Stack>
        </Box>

        <Separator />

        {/* SNSアカウントセクション */}
        <Box>
          <Heading
            size={{ base: "sm", sm: "md" }}
            mb={{ base: 4, sm: 6 }}
            fontSize={{ base: "lg", sm: "xl" }}
          >
            SNSアカウント（任意）
          </Heading>
          <Grid
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}
            gap={{ base: 4, sm: 6 }}
          >
            {/* gihub ID */}
            <GridItem>
              <Field.Root invalid={!!errors.githubId}>
                <Field.Label
                  htmlFor={"githubId"}
                  fontWeight="medium"
                  fontSize={{ base: "sm", sm: "md" }}
                  mb={{ base: 1, sm: 2 }}
                >
                  GitHub ID
                </Field.Label>
                <Input
                  id="githubId"
                  placeholder="あなたのGitHub ID"
                  fontSize={{ base: "16px", sm: "md" }}
                  height={{ base: "12" }}
                  {...register("githubId", {
                    maxLength: {
                      value: 20,
                      message: "20文字以下で入力してください",
                    },
                  })}
                />
                <Field.ErrorText>{errors.githubId?.message}</Field.ErrorText>
              </Field.Root>
            </GridItem>

            {/* qiita ID */}
            <GridItem>
              <Field.Root invalid={!!errors.qiitaId}>
                <Field.Label
                  htmlFor={"qiitaId"}
                  fontWeight="medium"
                  fontSize={{ base: "sm", sm: "md" }}
                  mb={{ base: 1, sm: 2 }}
                >
                  Qiita ID
                </Field.Label>
                <Input
                  id="qiitaId"
                  placeholder="あなたのQiita ID"
                  fontSize={{ base: "16px", sm: "md" }}
                  height={{ base: "12" }}
                  {...register("qiitaId", {
                    maxLength: {
                      value: 20,
                      message: "20文字以下で入力してください",
                    },
                  })}
                />
                <Field.ErrorText>{errors.qiitaId?.message}</Field.ErrorText>
              </Field.Root>
            </GridItem>

            {/* X ID */}
            <GridItem colSpan={{ base: 1, sm: 2 }}>
              <Field.Root invalid={!!errors.xId}>
                <Field.Label
                  htmlFor={"xId"}
                  fontWeight="medium"
                  fontSize={{ base: "sm", sm: "md" }}
                  mb={{ base: 1, sm: 2 }}
                >
                  X ID
                </Field.Label>
                <Input
                  id="xId"
                  placeholder="あなたのx ID"
                  fontSize={{ base: "16px", sm: "md" }}
                  height={{ base: "12" }}
                  {...register("xId", {
                    maxLength: {
                      value: 20,
                      message: "20文字以下で入力してください",
                    },
                  })}
                />
                <Field.ErrorText>{errors.xId?.message}</Field.ErrorText>
              </Field.Root>
            </GridItem>
          </Grid>
        </Box>

        <Separator />

        {/* 送信ボタン */}
        <Button
          type="submit"
          colorPalette="blue"
          size={{ base: "lg", sm: "lg" }}
          width="full"
          height={{ base: "12" }}
          fontSize={{ base: "md", sm: "lg" }}
          fontWeight="medium"
          loading={isSubmitting || creating}
          loadingText={"登録中..."}
        >
          登録
        </Button>
      </Stack>
    </form>
  );
}

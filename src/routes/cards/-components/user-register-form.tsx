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
  skillId: string;
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
      skillId: "",
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
      <Stack gap={{ base: "6", sm: "6", md: "4" }} mx="">
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
            mb={{ base: 4, sm: 6, md: 3 }}
            fontSize={{ base: "lg", sm: "xl", md: "lg" }}
            color={{ _light: "gray.900", _dark: "white" }}
          >
            基本情報
          </Heading>
          <Stack gap={{ base: "4", sm: "6", md: "3" }}>
            {/* すきな単語 */}
            <Field.Root invalid={!!errors.likeWord}>
              <Field.Label
                htmlFor={"likeWord"}
                fontWeight="medium"
                fontSize={{ base: "sm", sm: "md" }}
                mb={{ base: 1, sm: 2, md: 1 }}
              >
                好きな単語
              </Field.Label>
              <Input
                id="likeWord"
                placeholder="Apple"
                fontSize={{ base: "16px", sm: "md" }}
                height={{ base: "12", md: "10" }}
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
                mb={{ base: 1, sm: 2, md: 1 }}
              >
                名前
              </Field.Label>
              <Input
                id="name"
                placeholder="John Doe"
                fontSize={{ base: "16px", sm: "md" }}
                height={{ base: "12", md: "10" }}
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
                mb={{ base: 1, sm: 2, md: 1 }}
              >
                自己紹介
              </Field.Label>
              <Textarea
                id="desctiption"
                placeholder="僕の名前はJohn Doeです"
                resize="vertical"
                minH={{ base: "80px", sm: "100px", md: "70px" }}
                fontSize={{ base: "16px", sm: "md" }}
                {...register("desctiption", {
                  required: "内容の入力は必須です",
                  minLength: {
                    value: 1,
                    message: "1文字以上入力してください",
                  },
                  maxLength: {
                    value: 50,
                    message: "50文字以下で入力してください",
                  },
                })}
              />
              <Field.ErrorText>{errors.desctiption?.message}</Field.ErrorText>
            </Field.Root>

            {/* 好きな技術 */}
            <Field.Root invalid={!!errors.skillId}>
              <Field.Label
                fontWeight="medium"
                fontSize={{ base: "sm", sm: "md" }}
                mb={{ base: 1, sm: 2, md: 1 }}
              >
                好きな技術 *
              </Field.Label>
              <Controller
                control={control}
                name="skillId"
                rules={{
                  required: "技術を選択してください",
                }}
                render={({ field }) => (
                  <Select.Root
                    collection={skillCollection}
                    value={field.value ? [field.value] : []}
                    onValueChange={({ value }) => field.onChange(value[0])}
                    onInteractOutside={() => field.onBlur()}
                    closeOnSelect={true}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText
                          placeholder="技術を選択してください"
                          color={{
                            _light: "gray.400",
                            _dark: "blue.300",
                          }}
                        />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content
                        color={{ _light: "white", _dark: "white" }}
                      >
                        {skillCollection.items.map((skill) => (
                          <Select.Item item={skill} key={skill.skillId}>
                            {skill.name}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                )}
              />
              <Field.ErrorText>{errors.skillId?.message}</Field.ErrorText>
            </Field.Root>
          </Stack>
        </Box>

        <Separator />

        {/* SNSアカウントセクション */}
        <Box>
          <Heading
            size={{ base: "sm", sm: "md" }}
            mb={{ base: 4, sm: 6, md: 3 }}
            fontSize={{ base: "lg", sm: "xl", md: "lg" }}
            color={{ _light: "gray.900", _dark: "white" }}
          >
            SNSアカウント（任意）
          </Heading>
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            }}
            gap={{ base: 4, sm: 6, md: 3 }}
          >
            {/* gihub ID */}
            <GridItem>
              <Field.Root invalid={!!errors.githubId}>
                <Field.Label
                  htmlFor={"githubId"}
                  fontWeight="medium"
                  fontSize={{ base: "sm", sm: "md" }}
                  mb={{ base: 1, sm: 2, md: 1 }}
                >
                  GitHub ID
                </Field.Label>
                <Input
                  id="githubId"
                  placeholder="あなたのGitHub ID"
                  fontSize={{ base: "16px", sm: "md" }}
                  height={{ base: "12", md: "10" }}
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
                  mb={{ base: 1, sm: 2, md: 1 }}
                >
                  Qiita ID
                </Field.Label>
                <Input
                  id="qiitaId"
                  placeholder="あなたのQiita ID"
                  fontSize={{ base: "16px", sm: "md" }}
                  height={{ base: "12", md: "10" }}
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
            <GridItem colSpan={{ base: 1, sm: 2, md: 1 }}>
              <Field.Root invalid={!!errors.xId}>
                <Field.Label
                  htmlFor={"xId"}
                  fontWeight="medium"
                  fontSize={{ base: "sm", sm: "md" }}
                  mb={{ base: 1, sm: 2, md: 1 }}
                >
                  X ID
                </Field.Label>
                <Input
                  id="xId"
                  placeholder="あなたのx ID"
                  fontSize={{ base: "16px", sm: "md" }}
                  height={{ base: "12", md: "10" }}
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
          size={{ base: "lg", sm: "lg", md: "md" }}
          width="full"
          height={{ base: "12", md: "10" }}
          fontSize={{ base: "md", sm: "lg", md: "md" }}
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

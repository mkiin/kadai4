import {
  Button,
  createListCollection,
  Field,
  Input,
  Portal,
  Select,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
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
    useUserRegisterMutation(() => {
      navigate({ to: "/" });
    });

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
      <Stack gap="6">
        {/* すきな単語 */}
        <Field.Root invalid={!!errors.likeWord}>
          <Field.Label htmlFor={"likeWord"}>好きな単語</Field.Label>
          <Input
            id="likeWord"
            placeholder="Apple"
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
          <Field.Label htmlFor={"name"}>名前</Field.Label>
          <Input
            id="name"
            placeholder="John Doe"
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
          <Field.Label htmlFor={"desctiption"}>自己紹介</Field.Label>
          <Textarea
            id="desctiption"
            placeholder="僕の名前はJohn Doeです"
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
        <Stack>
          <Field.Root invalid={!!errors.skills}>
            <Field.Label>好きな技術</Field.Label>
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

        {/* gihub ID */}
        <Field.Root invalid={!!errors.githubId}>
          <Field.Label htmlFor={"githubId"}>GitHub ID</Field.Label>
          <Input
            id="githubId"
            placeholder="あなたのGitHub ID"
            {...register("githubId", {
              maxLength: {
                value: 20,
                message: "20文字以下で入力してください",
              },
            })}
          />
          <Field.ErrorText>{errors.githubId?.message}</Field.ErrorText>
        </Field.Root>

        {/* qiita ID */}
        <Field.Root invalid={!!errors.qiitaId}>
          <Field.Label htmlFor={"qiitaId"}>Qiita ID</Field.Label>
          <Input
            id="qiitaId"
            placeholder="あなたのQiita ID"
            {...register("qiitaId", {
              maxLength: {
                value: 20,
                message: "20文字以下で入力してください",
              },
            })}
          />
          <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.xId}>
          <Field.Label htmlFor={"xId"}>X ID</Field.Label>
          <Input
            id="xId"
            placeholder="あなたのx ID"
            {...register("xId", {
              maxLength: {
                value: 20,
                message: "20文字以下で入力してください",
              },
            })}
          />
          <Field.ErrorText>{errors.xId?.message}</Field.ErrorText>
        </Field.Root>

        {/* 送信ボタン */}
        <Button
          type="submit"
          colorPalette="blue"
          size="lg"
          width="full"
          loading={isSubmitting || creating}
          loadingText={"登録中..."}
        >
          登録
        </Button>
      </Stack>
    </form>
  );
}

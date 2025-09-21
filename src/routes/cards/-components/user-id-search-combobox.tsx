import {
  Box,
  Button,
  Combobox,
  Field,
  Portal,
  Stack,
  Text,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

type SeachUserIdProps = {
  userIds: Array<{ userId: string }>;
};

export function UserIdSearchCombobox({ userIds }: SeachUserIdProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [currentValue, setCurrentValue] = useState<string>(""); // 現在の値を管理

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: userIds.map((id) => ({ label: id.userId, value: id.userId })),
    filter: contains,
  });

  const validateUserId = (value: string) => {
    if (!value || value.trim() === "") {
      return "ユーザーIDを入力してください";
    }
    if (!userIds.some((user) => user.userId === value)) {
      return "存在しないユーザーIDです";
    }
    return null;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateUserId(currentValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    navigate({ to: `/cards/${currentValue}` });
  };

  const handleInputChange = (details: Combobox.InputValueChangeDetails) => {
    filter(details.inputValue);
    setCurrentValue(details.inputValue); // 入力値を管理
    if (error) setError(""); // エラーをクリア
  };

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    // アイテム選択時の処理
    const selectedValue = details.value[0] || "";
    setCurrentValue(selectedValue);
    if (error) setError(""); // エラーをクリア
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={{ base: 4, sm: 5 }}>
        <Box textAlign={"center"}>
          <Text
            fontSize={{ base: "xs", sm: "sm" }}
            color="fg.muted"
            mb={2}
            lineHeight="1.4"
          >
            登録済みのユーザーIDを入力または選択してください
          </Text>
        </Box>
        <Field.Root invalid={!!error}>
          <Field.Label
            fontSize={{ base: "sm", sm: "md" }}
            fontWeight="medium"
            mb={{ base: 1, sm: 2 }}
          >
            ユーザID検索
          </Field.Label>
          <Combobox.Root
            collection={collection}
            onInputValueChange={handleInputChange}
            onValueChange={handleValueChange} // 重要：選択時の処理を追加
            allowCustomValue={true}
            selectionBehavior="replace" // 選択時に入力フィールドを更新
          >
            <Combobox.Control>
              <Combobox.Input
                placeholder="ユーザーIDを入力してください"
                fontSize={{ base: "16px", sm: "md" }}
                height={{ base: "12", sm: "auto" }}
              />
              <Combobox.IndicatorGroup>
                <Combobox.ClearTrigger />
              </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Portal>
              <Combobox.Positioner>
                <Combobox.Content
                  maxH={{ base: "200px", sm: "300px" }}
                  overflowY="auto"
                  shadow="md"
                  borderRadius="md"
                  fontSize={{ base: "sm", sm: "md" }}
                >
                  <Combobox.Empty>
                    <Box
                      p={{ base: 2, sm: 3 }}
                      textAlign="center"
                      color="fg.muted"
                      fontSize={{ base: "xs", sm: "sm" }}
                    >
                      該当するユーザーIDが見つかりません
                    </Box>
                  </Combobox.Empty>
                  {collection.items.map((item) => (
                    <Combobox.Item
                      key={item.value}
                      item={item}
                      _hover={{ bg: "bg.subtle" }}
                      cursor="pointer"
                      fontSize={{ base: "sm", sm: "md" }}
                      minHeight={{ base: "44px", sm: "auto" }}
                    >
                      <Box
                        py={{ base: 3, sm: 2 }}
                        display="flex"
                        alignItems="center"
                      >
                        {item.label}
                      </Box>
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ))}
                </Combobox.Content>
              </Combobox.Positioner>
            </Portal>
          </Combobox.Root>
          {error && (
            <Field.ErrorText
              fontSize={{ base: "xs", sm: "sm" }}
              mt={{ base: 1, sm: 2 }}
            >
              {error}
            </Field.ErrorText>
          )}
        </Field.Root>
        <Button
          type="submit"
          size={{ base: "lg", sm: "lg" }}
          colorPalette="blue"
          width="full"
          height={{ base: "12", sm: "14" }}
          fontSize={{ base: "md", sm: "lg" }}
          fontWeight="medium"
        >
          名刺を見に行く
        </Button>
      </Stack>
    </form>
  );
}

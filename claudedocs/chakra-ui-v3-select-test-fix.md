# Chakra UI v3のSelectコンポーネントでテストが失敗する問題と解決方法

## はじめに

Chakra UI v3のSelectコンポーネントを使ったフォームのテストを書いていたところ、以下のエラーに遭遇しました。

```bash
TypeError: getContentEl(...)?.scrollTo is not a function
```

この記事では、この問題の原因と解決方法を解説します。

## 環境

- Chakra UI: v3.x
- Vitest: 3.2.4
- Testing Library: @testing-library/react
- JSDom環境でのテスト実行

## 問題のコード

### Selectコンポーネントの実装

```tsx
import { Portal, Select } from "@chakra-ui/react";

<Select.Root
  collection={skillCollection}
  value={field.value ? [field.value] : []}
  onValueChange={({ value }) => field.onChange(value[0])}
>
  <Select.HiddenSelect />
  <Select.Control>
    <Select.Trigger>
      <Select.ValueText placeholder="技術を選択してください" />
    </Select.Trigger>
  </Select.Control>
  <Portal>
    <Select.Positioner>
      <Select.Content>
        {skillCollection.items.map((skill) => (
          <Select.Item item={skill} key={skill.skillId}>
            {skill.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Positioner>
  </Portal>
</Select.Root>
```

### テストコード

```tsx
test("全項目入力して登録ボタンを押すと/に遷移する", async () => {
  const user = userEvent.setup();

  // Selectトリガーをクリック
  const skillTrigger = screen.getByText("技術を選択してください");
  await user.click(skillTrigger);

  // オプションを選択
  const reactOption = await screen.findByRole("option", { name: "React" });
  await user.click(reactOption);

  // フォーム送信
  const submitButton = await screen.findByRole("button", { name: "登録" });
  await user.click(submitButton);
});
```

## 発生したエラー

テストを実行すると以下の2つの問題が発生しました。

### 1. scrollToが実装されていないエラー

```bash
TypeError: getContentEl(...)?.scrollTo is not a function
❯ scrollContentToTop node_modules/@zag-js/select/dist/index.mjs:1072:32
```

Chakra UI v3のSelectコンポーネントは内部で`@zag-js/select`を使用しており、これが`Element.prototype.scrollTo`を呼び出します。しかし、JSDom環境ではこのメソッドが実装されていないため、エラーが発生します。

### 2. Portalによるレンダリング問題

`<Portal>`を使用すると、Selectのドロップダウンが`document.body`直下にレンダリングされますが、JSDom環境では期待通りに動作せず、テストでオプションを見つけられない場合があります。

## 解決方法

### 解決策1: scrollToのモックを追加

`tests/setup.ts`ファイルで、`scrollTo`と`scrollIntoView`をモックします。

```typescript:tests/setup.ts
import { vi } from "vitest";

// Scroll Methods mock
window.Element.prototype.scrollTo = vi.fn();
window.Element.prototype.scrollIntoView = vi.fn();
global.Element.prototype.scrollTo = vi.fn();
global.Element.prototype.scrollIntoView = vi.fn();
```

**ポイント**: `window.Element.prototype`だけでなく、`global.Element.prototype`にもモックを設定することが重要です。

### 解決策2: Portalを削除

テスト環境では`Portal`を使用せず、インラインでレンダリングします。

```tsx
import { Select } from "@chakra-ui/react";

<Select.Root
  collection={skillCollection}
  value={field.value ? [field.value] : []}
  onValueChange={({ value }) => field.onChange(value[0])}
>
  <Select.HiddenSelect />
  <Select.Control>
    <Select.Trigger>
      <Select.ValueText placeholder="技術を選択してください" />
    </Select.Trigger>
  </Select.Control>
  {/* Portalを削除 */}
  <Select.Positioner>
    <Select.Content>
      {skillCollection.items.map((skill) => (
        <Select.Item item={skill} key={skill.skillId}>
          {skill.name}
        </Select.Item>
      ))}
    </Select.Content>
  </Select.Positioner>
</Select.Root>
```

## テストコードのポイント

### find*とget*の使い分け

Selectコンポーネントのテストでは、`find*`と`get*`の使い分けが重要です。

```tsx
// ✅ 正しい: Selectトリガーは既にDOM上に存在
const skillTrigger = screen.getByText("技術を選択してください");
await user.click(skillTrigger);

// ✅ 正しい: オプションは動的に表示されるため待機が必要
const reactOption = await screen.findByRole("option", { name: "React" });
await user.click(reactOption);

// ❌ 間違い: getを使うとオプションが見つからずエラー
const reactOption = screen.getByRole("option", { name: "React" });
```

**判断基準**:
- **get\***: 既にDOM上に存在する要素（フォーム入力、静的テキストなど）
- **find\***: 後から表示される要素（ドロップダウンの選択肢、エラーメッセージなど）

### 完全なテストコード例

```tsx
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

test("Selectコンポーネントで技術を選択して登録できる", async () => {
  const user = userEvent.setup();

  // ページの初期レンダリングを待機
  await screen.findByText("新規名刺登録");

  // フォーム入力（既に存在する要素）
  const likeWordInput = screen.getByLabelText("好きな単語");
  await user.click(likeWordInput);
  await user.paste("test_word");

  const nameInput = screen.getByLabelText("名前");
  await user.click(nameInput);
  await user.paste("テストユーザー");

  // Selectトリガーをクリック（既に存在する要素）
  const skillTrigger = screen.getByText("技術を選択してください");
  await user.click(skillTrigger);

  // オプションを選択（動的に表示される要素）
  const reactOption = await screen.findByRole("option", { name: "React" });
  await user.click(reactOption);

  // フォーム送信
  const submitButton = await screen.findByRole("button", { name: "登録" });
  await user.click(submitButton);

  // 遷移を確認
  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/");
  });

  // APIが呼ばれたことを確認
  expect(mockCreateUser).toHaveBeenCalledWith({
    skillId: "1",
    // ...その他のフィールド
  });
});
```

## まとめ

Chakra UI v3のSelectコンポーネントをテストする際の注意点:

1. **scrollToのモック**: `global.Element.prototype.scrollTo`をモックする
2. **Portalの削除**: JSDom環境ではPortalを使用せずインラインレンダリング
3. **find\*の使用**: ドロップダウンの選択肢は`findByRole`で待機する

これらの対応により、Selectコンポーネントのテストが正常に動作するようになります。

## 参考

- [Chakra UI v3 Documentation](https://www.chakra-ui.com/)
- [Testing Library - Queries](https://testing-library.com/docs/queries/about/)
- [Zag.js Select](https://zagjs.com/components/react/select)

## 補足: Portalを削除することの影響

本番環境では`Portal`を使用することで、z-indexの問題を回避し、適切なレイヤリングを実現できます。テスト環境でのみPortalを削除したい場合は、環境変数で分岐する方法も検討できます。

```tsx
{process.env.NODE_ENV === 'test' ? (
  <Select.Positioner>
    <Select.Content>{/* ... */}</Select.Content>
  </Select.Positioner>
) : (
  <Portal>
    <Select.Positioner>
      <Select.Content>{/* ... */}</Select.Content>
    </Select.Positioner>
  </Portal>
)}
```

ただし、多くの場合、Portalなしでも実用上問題ないため、シンプルに削除する方が保守性が高くなります。
# テストの不安定性（Flakiness）の原因調査と解決

## 問題

テストが**成功するときと失敗するときがある**不安定な状態になっていました。

```bash
# 失敗時
× 存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する 1128ms
Test Files  1 failed (1)
Tests  1 failed | 5 passed (6)

# 成功時
✓ 存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する 127ms
Test Files  1 passed (1)
Tests  6 passed (6)
```

## 原因分析

### 1. React Act Warning

テスト実行時に以下の警告が出ていました：

```
An update to ForwardRef(ComboboxImpl) inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
```

これは、**Reactの状態更新が完了する前に次の操作に進んでいる**ことを示しています。

### 2. 遷移失敗

```bash
AssertionError: expected '/' to be '/cards/sample_id'
Expected: "/cards/sample_id"
Received: "/"
```

フォーム送信後に遷移が発生せず、`/`のままでした。これは入力値が正しく設定されていないため、バリデーションエラーで遷移がブロックされていることを意味します。

### 3. タイミング問題

問題のコードは以下でした：

```typescript
await user.click(combobox);
await user.clear(combobox);
await user.type(combobox, "sample_id"); // ❌ 非同期処理が完全に終わる前に次に進む
await userEvent.click(document.body);

const submitButton = await screen.findByRole("button", {
  name: "検索",
});
await user.click(submitButton); // ❌ 入力が完了していない可能性がある
```

`user.type()`は文字を1つずつ入力する非同期処理ですが、その完了を待たずに次の操作（フォーカスを外す、送信ボタンをクリック）に進んでいました。

### 4. レースコンディション

以下の3つの非同期処理が競合していました：

1. `user.type()` - 文字入力
2. Comboboxの状態更新（入力値の検証）
3. フォーム送信

これらのタイミングによって、以下のシナリオが発生していました：

- **成功ケース**: 入力完了 → 検証完了 → 送信 → 遷移成功
- **失敗ケース**: 入力途中 → 送信 → バリデーションエラー → 遷移失敗

## 解決策

### 修正前

```typescript
await user.click(combobox);
await user.clear(combobox);
await user.type(combobox, "sample_id"); // ❌ 完了を待たない
await userEvent.click(document.body);

const submitButton = await screen.findByRole("button", {
  name: "検索",
});
await user.click(submitButton);
```

### 修正後

```typescript
await user.click(combobox);
await user.clear(combobox);
await user.paste("sample_id"); // ✅ pasteは即座に値を設定

// ✅ 入力が確実に反映されるまで待つ
await vi.waitFor(() => {
  expect(combobox).toHaveValue("sample_id");
});

await userEvent.click(document.body);

const submitButton = await screen.findByRole("button", {
  name: "検索",
});
await user.click(submitButton);
```

### 変更点

1. **`user.type()` → `user.paste()`**:
   - `type()`: 文字を1つずつ入力する非同期処理
   - `paste()`: 値を即座に設定する同期的な処理

2. **明示的な待機追加**:
   ```typescript
   await vi.waitFor(() => {
     expect(combobox).toHaveValue("sample_id");
   });
   ```
   - Comboboxの値が正しく設定されるまで待機
   - Reactの状態更新が完了するのを確実に待つ

## 検証結果

### 修正前（不安定）

```bash
Run 1: ✓ passed
Run 2: × failed
Run 3: ✓ passed
Run 4: × failed
Run 5: ✓ passed
成功率: 60% (3/5)
```

### 修正後（安定）

```bash
Run 1-10: ✓ passed
成功率: 100% (10/10)
```

## テストの不安定性（Flakiness）を防ぐベストプラクティス

### 1. 非同期処理の完了を確実に待つ

```typescript
// ❌ 避けるべき
await user.type(input, "value");
await user.click(button); // すぐクリック

// ✅ 推奨
await user.paste("value");
await vi.waitFor(() => {
  expect(input).toHaveValue("value");
});
await user.click(button);
```

### 2. 状態の変化を明示的に検証

```typescript
// ❌ 避けるべき - 暗黙的な待機
await user.click(button);
expect(router.state.location.pathname).toBe("/next");

// ✅ 推奨 - 明示的な待機
await user.click(button);
await vi.waitFor(() => {
  expect(router.state.location.pathname).toBe("/next");
});
```

### 3. Act Warningに注意

React Testing Libraryの`act()`警告が出た場合、以下を確認：

- 状態更新が完了する前に次の操作をしていないか
- 適切な`await`や`waitFor`を使っているか
- 非同期処理が完全に終わるのを待っているか

### 4. userEvent.paste vs userEvent.type

| メソッド | 処理方法 | 速度 | 安定性 | 使い分け |
|---------|---------|------|--------|---------|
| `type()` | 1文字ずつ非同期入力 | 遅い | 低い | リアルなタイプ動作を再現 |
| `paste()` | 値を即座に設定 | 速い | **高い** | 確実に値を設定、テストの安定性重視 |

**推奨**: テストの安定性を優先する場合は`paste()`を使用する。

### 5. デバッグ方法

不安定なテストをデバッグする際の手順：

```typescript
// 1. 値の確認
console.log("Value:", input.value);

// 2. 待機の追加
await vi.waitFor(() => {
  console.log("Checking value:", input.value);
  expect(input).toHaveValue("expected");
});

// 3. スクリーンショット（必要に応じて）
screen.debug();
```

## 一貫性の問題

修正過程で、**同じテストファイル内で`user.type()`と`user.paste()`が混在する**問題が発見されました：

```typescript
// テストA（存在しないID）
await user.type(combobox, "ダミーID");  // ❌ 待機なし

// テストB（存在するID）
await user.type(combobox, "sample_id"); // ❌ 待機あり
await vi.waitFor(() => {
  expect(combobox).toHaveValue("sample_id");
});
```

### なぜ問題なのか

1. **一貫性の欠如**: 同じ操作なのに異なる実装
2. **メンテナンス性の低下**: どちらが正しいパターンか不明確
3. **潜在的なバグ**: 待機のないテストは将来的に不安定になる可能性

### 統一後

```typescript
// すべてのテストで統一
await user.paste("値");
await vi.waitFor(() => {
  expect(combobox).toHaveValue("値");
});
```

## まとめ

テストの不安定性（Flakiness）は、以下の要因で発生します：

1. **非同期処理の不完全な待機** - 処理が完了する前に次の操作に進む
2. **レースコンディション** - 複数の非同期処理のタイミングが不定
3. **状態更新の検証不足** - 状態が更新されたことを確認せずに進む
4. **実装の不一致** - 同じ操作を異なる方法で実装

これらを防ぐには：

- ✅ `paste()`を使って即座に値を設定
- ✅ `vi.waitFor()`で明示的に状態の完了を待つ
- ✅ Act Warningが出たら原因を調査
- ✅ 連続実行でテストの安定性を検証
- ✅ **すべてのテストで同じパターンを使用** ← 重要

これにより、**100%再現可能で信頼性の高いテスト**を作成できます。

## 参考リンク

- [Testing Library - Async Methods](https://testing-library.com/docs/dom-testing-library/api-async/)
- [React - Act Warning](https://react.dev/link/wrap-tests-with-act)
- [Vitest - waitFor](https://vitest.dev/api/vi.html#vi-waitfor)
- [User Event - Type vs Paste](https://testing-library.com/docs/user-event/utility#paste)
# user.type()で文字がスキップされる根本原因の調査

## 実験結果

### テストケース比較

| ケース | 入力文字列 | 実際の値 | 結果 | 欠落文字数 | 特徴 |
|--------|----------|---------|------|-----------|------|
| A | `"ダミーID"` (5文字) | `"ダミーD"` | ✅ 成功* | 1文字 | 遷移なし |
| B | `"sample_id"` (9文字) | `"saml_d"` | ❌ 失敗 | 3文字 | 遷移あり |
| C | `"sample_id"` + `delay: 50ms` | `"sample_id"` | ✅ 成功 | 0文字 | 遅延追加 |
| D | `"sample_id"` + `vi.waitFor()` | `"saml_d"` | ❌ 失敗 | 3文字 | 待機追加 |

*ケースAは入力値が不完全でも、エラー表示のみで遷移がないため成功

### 実際のコンソール出力

```bash
=== ケースA ===
Before type:
After type: ダミーD        # ❌ "ダミーID" → "ダミーD"（"I"が欠落）

=== ケースB ===
Before type:
After type: saml_d        # ❌ "sample_id" → "saml_d"（"p"、"e"、"i"が欠落）

=== ケースC（delay: 50ms） ===
Before type:
After type: sample_id     # ✅ 完全に入力される

=== ケースD（waitFor追加） ===
Before type:
After type: saml_d        # ❌ waitForを追加しても欠落
Waiting for value: saml_d
Waiting for value: saml_d
...（タイムアウトまで繰り返し）
```

## 根本原因の分析

### 1. user.type()のデフォルト動作

```typescript
// デフォルト（delay: null）
const user = userEvent.setup();
await user.type(input, "sample_id");
// → 文字間の遅延が0ms = 処理が追いつかず文字がスキップされる
```

`@testing-library/user-event` v14.6.1のデフォルトでは、文字間に遅延がなく、**Reactの状態更新が追いつかない**ため文字がスキップされます。

### 2. 文字スキップのパターン

```
入力文字列の長さと欠落率の関係:
- 5文字 ("ダミーID") → 1文字欠落 (20%)
- 9文字 ("sample_id") → 3文字欠落 (33%)

傾向: 長い文字列ほど欠落率が高い
```

### 3. なぜケースAは「成功」したのか

```typescript
// ケースA: 遷移がないテスト
await user.type(combobox, "ダミーID");
// 実際の値: "ダミーD"
// ↓
// 存在しないID → バリデーションエラー表示
// ↓
// エラーメッセージを確認 → テスト成功 ✅

// ケースB: 遷移が必要なテスト
await user.type(combobox, "sample_id");
// 実際の値: "saml_d"
// ↓
// 存在しないID → バリデーションエラー
// ↓
// 遷移しない → テスト失敗 ❌
```

**重要**: ケースAは**たまたま成功している**だけで、入力は不完全です。

### 4. vi.waitFor()が効かない理由

```typescript
await user.type(combobox, "sample_id");
// ↑ この時点で既に"saml_d"が入力済み（非同期処理完了）

await vi.waitFor(() => {
  expect(combobox).toHaveValue("sample_id"); // ❌ 永遠に待つ
});
```

`await user.type()`が返ってきた時点で、userEventは「入力完了」と判断しています。その後に`waitFor()`を追加しても、**既に欠落した状態**なので効果がありません。

## 解決策の比較

### 方法1: delayを追加（成功）

```typescript
const user = userEvent.setup({ delay: 50 }); // 文字間に50ms遅延
await user.type(combobox, "sample_id");
// → 完全に入力される ✅
```

**メリット**:
- リアルなユーザー操作を再現
- Reactの状態更新が追いつく

**デメリット**:
- テスト実行時間が長くなる
- 遅延値の調整が必要（環境依存）

### 方法2: user.paste()を使用（推奨）

```typescript
const user = userEvent.setup();
await user.paste("sample_id");
await vi.waitFor(() => {
  expect(combobox).toHaveValue("sample_id");
});
// → 即座に完全な値が設定される ✅
```

**メリット**:
- 高速（遅延なし）
- 確実に値が設定される
- 環境に依存しない

**デメリット**:
- リアルなタイプ動作とは異なる
- キーイベントハンドラーが発火しない場合がある

## 環境情報

```json
{
  "@testing-library/user-event": "^14.6.1",
  "@testing-library/react": "^16.2.0",
  "vitest": "^3.2.4",
  "react": "^19.1.1"
}
```

## なぜこの問題が起きるのか

### 理由1: イベントループの処理速度

```
user.type()の処理フロー（delay: null）:

1. 's' 入力 → keydown → keypress → input → keyup
2. 'a' 入力 → keydown → keypress → input → keyup  ← React更新中
3. 'm' 入力 → keydown → keypress → input → keyup  ← 追いつかない
4. 'p' 入力 → ...                                  ← スキップ
5. 'l' 入力 → ...
...

結果: 一部の文字がスキップされる
```

### 理由2: Chakra UI Comboboxの内部処理

Chakra UIのComboboxコンポーネントは、入力値の変化に対して：
1. 値の検証
2. オートコンプリートの候補更新
3. 状態の同期

これらの処理が完了する前に次の文字が入力されると、スキップが発生します。

### 理由3: Testing Library User Eventの設計

```typescript
// v14のデフォルト
userEvent.setup(); // delay: null（遅延なし）

// リアルなタイピングを再現したい場合
userEvent.setup({ delay: 50 }); // 推奨値
```

v14では、**速度優先**でデフォルトが遅延なしになっています。

## 結論

### type()が「うまくいく」ケースと「いかない」ケースの違い

| 要因 | うまくいく | いかない |
|------|----------|---------|
| **文字列の長さ** | 短い（3-4文字） | 長い（7文字以上） |
| **遅延設定** | `delay: 50`以上 | `delay: null`（デフォルト） |
| **処理の複雑さ** | シンプルな入力 | バリデーション・候補検索あり |
| **テストの要求** | 値の存在確認のみ | 正確な値が必要（遷移など） |

### ケースAが「成功」した理由

1. **短い文字列**: `"ダミーID"` (5文字) は欠落が少ない
2. **エラーメッセージ表示のみ**: 正確な値が不要
3. **遷移なし**: バリデーションエラーでも目的は達成

### ケースBが「失敗」した理由

1. **長い文字列**: `"sample_id"` (9文字) は欠落が多い
2. **正確な値が必要**: IDマッチングで遷移
3. **欠落により不一致**: `"saml_d"` ≠ `"sample_id"`

## 推奨パターン

### パターン1: 高速で確実（推奨）

```typescript
await user.paste("値");
await vi.waitFor(() => {
  expect(input).toHaveValue("値");
});
```

### パターン2: リアルなタイピング再現

```typescript
const user = userEvent.setup({ delay: 50 });
await user.type(input, "値");
await vi.waitFor(() => {
  expect(input).toHaveValue("値");
});
```

### パターン3: 短い文字列の場合（注意）

```typescript
// 3-4文字程度ならデフォルトでも動作する可能性
await user.type(input, "OK");
// ただし環境依存なので非推奨
```

## まとめ

`user.type()`で文字がスキップされる根本原因：

1. **デフォルトで遅延がない** → Reactの更新が追いつかない
2. **Comboboxの複雑な処理** → 各入力で検証・候補更新が走る
3. **文字列が長い** → 処理時間が増えてスキップ率が上がる

**解決策**:
- ✅ `user.paste()`を使用（高速・確実）
- ✅ `delay: 50`を追加（リアル再現）
- ❌ `vi.waitFor()`だけでは解決しない（既に欠落済み）

**ケースAが成功した理由**:
- 短い文字列で欠落が少ない
- エラー表示のみで正確な値が不要
- **たまたま動いているだけ**で本質的には不完全
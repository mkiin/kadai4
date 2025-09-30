# TanStack QueryのAPIモック化で遭遇したトラブルと解決方法

## 概要

React + TanStack Router + TanStack Queryを使ったアプリケーションで、Testing Library + Vitestを使ってテストを書く際に遭遇したAPIモックの問題と、その解決過程を記録します。

## 環境

- **フレームワーク**: React 19.1.1
- **ルーティング**: TanStack Router
- **データフェッチング**: TanStack Query
- **テストツール**: Vitest 3.2.4, Testing Library
- **言語**: TypeScript

## 初期状態: 全テスト失敗

### エラー内容

```bash
stderr | tests/routes/index.test.tsx
{
  message: 'TypeError: fetch failed',
  details: 'TypeError: fetch failed\n' +
    '    at node:internal/deps/undici/undici:13510:13\n' +
    '    at processTicksAndRejections (node:internal/process/task_queues:105:5)\n' +
    '    at getAllUserIds (/home/yaruha/.../src/routes/cards/-api/user.ts:38:35)',
  hint: '',
  code: ''
}

Test Files  1 failed (1)
Tests  5 failed | 1 passed (6)
```

テスト環境で実際のAPIエンドポイント（Supabase）にアクセスしようとして失敗していました。

## 問題1: モックの基本設定ミス

### 原因

1. `vi`が未インポート
2. `beforeEach`が未インポート
3. モックパスが相対パスで間違っている
4. モックデータの設定がない

### Before

```typescript
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { getQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetAllUserIds = vi.fn(); // ❌ viが未定義

vi.mock("./cards/-api/user-query", () => ({ // ❌ 相対パスが間違い
  userIdsQueryOptions: () => ({
    queryKey: ["users"],
    queryFn: mockGetAllUserIds,
  }),
}));

describe("ホームページテスト", () => {
  beforeEach(() => { // ❌ beforeEachが未インポート
    vi.clearAllMocks();
  });
  // ...
});
```

### After

```typescript
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest"; // ✅ vi, beforeEachを追加
import { getQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetAllUserIds = vi.fn();
const mockGetUserById = vi.fn(); // ✅ 詳細取得用のモックも追加

vi.mock("@/routes/cards/-api/user-query", () => ({ // ✅ 絶対パスに修正
  userIdsQueryOptions: () => ({
    queryKey: ["users"],
    queryFn: mockGetAllUserIds,
  }),
  userQueryOptions: (id: string) => ({ // ✅ ユーザー詳細取得もモック化
    queryKey: ["users", id],
    queryFn: () => mockGetUserById(id),
  }),
}));

describe("ホームページテスト", () => {
  beforeEach(() => {
    mockGetAllUserIds.mockClear();
    mockGetUserById.mockClear();

    // ✅ デフォルトのモックデータを設定
    mockGetAllUserIds.mockResolvedValue([
      { userId: "apple" },
      { userId: "sample_id" },
    ]);

    mockGetUserById.mockResolvedValue({
      user_id: "sample_id",
      name: "Sample User",
      description: "Test description",
      github_id: null,
      qiita_id: null,
      x_id: null,
      user_skill: [],
    });
  });
  // ...
});
```

### 結果

基本的なモック設定は動作するようになりましたが、まだ一部のテストが失敗していました。

## 問題2: vi.clearAllMocks()による実装クリア

### 現象

特定のテストだけモックが呼ばれず、呼び出し回数が0になる。

```bash
mockGetAllUserIds calls: 0
× 存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する
  → expected 0 to be greater than 0
```

### 原因

`beforeEach`で`vi.clearAllMocks()`を使用すると、**モックの実装自体もクリアされてしまう**ため、`mockResolvedValue`の設定が消えてしまっていました。

### Before

```typescript
beforeEach(() => {
  vi.clearAllMocks(); // ❌ モック実装もクリアされる

  // この設定が無効になる
  mockGetAllUserIds.mockResolvedValue([
    { userId: "apple" },
    { userId: "sample_id" },
  ]);
});
```

### After

```typescript
beforeEach(() => {
  // ✅ 呼び出し履歴だけをクリア（実装は保持）
  mockGetAllUserIds.mockClear();
  mockGetUserById.mockClear();

  // ✅ この設定が有効になる
  mockGetAllUserIds.mockResolvedValue([
    { userId: "apple" },
    { userId: "sample_id" },
  ]);

  mockGetUserById.mockResolvedValue({
    user_id: "sample_id",
    name: "Sample User",
    description: "Test description",
    github_id: null,
    qiita_id: null,
    x_id: null,
    user_skill: [],
  });
});
```

### 違いの説明

| メソッド | 呼び出し履歴 | モック実装 | 使い分け |
|---------|------------|----------|---------|
| `vi.clearAllMocks()` | クリア | クリア | テスト間で完全にリセットしたい場合 |
| `mockFn.mockClear()` | クリア | **保持** | 実装を保ちつつ呼び出し履歴だけリセット |
| `vi.resetAllMocks()` | クリア | デフォルトに戻す | - |

## 問題3: QueryClientのキャッシュによる影響

### 現象

前のテストのキャッシュが残っていて、新しいテストでモックが呼ばれない。

### 原因

TanStack Queryは取得したデータをキャッシュするため、前のテストで取得したデータが残っていると、新しいテストでAPIを呼ばずにキャッシュを返してしまいます。

### 解決策

各テストの最初で`queryClient.clear()`を呼んでキャッシュをクリアします。

```typescript
test("存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する", async () => {
  // ✅ QueryClientのキャッシュをクリアして、新規にデータ取得させる
  const queryClient = getQueryClient();
  queryClient.clear();

  const { router } = renderRouter({ initialLocation: "/" });
  // ...
});
```

## 問題4: userEvent.type()での入力スキップ

### 現象

```bash
value="saml_d"  // ❌ "sample_id"が"saml_d"になっている（"e"と"i"がスキップ）
存在しないユーザーIDです
```

遷移が失敗し、入力値が不完全でバリデーションエラーになっていました。

### 原因

`userEvent.setup({ delay: 1 })`で遅延を1msに設定していたため、入力が速すぎて一部の文字がスキップされました。

### Before

```typescript
test("存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する", async () => {
  const user = userEvent.setup({ delay: 1 }); // ❌ 速すぎる

  await user.click(combobox);
  await user.clear(combobox);
  await user.type(combobox, "sample_id"); // ❌ 文字がスキップされる
  // ...
});
```

### After

```typescript
test("存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する", async () => {
  const user = userEvent.setup(); // ✅ デフォルト設定を使用

  await user.click(combobox);
  await user.clear(combobox);
  await user.paste("sample_id"); // ✅ pasteを使うと確実
  // ...
});
```

### type vs paste

| メソッド | 動作 | 速度 | 使い分け |
|---------|-----|------|---------|
| `user.type()` | 1文字ずつ入力イベント発火 | 遅い（デフォルト：文字間0ms） | リアルなユーザー入力を再現したい |
| `user.paste()` | ペーストイベント発火 | 速い | 確実に値を設定したい、入力過程より結果が重要 |

## 問題5: モックが呼ばれたことの検証

### 目的

実際のAPIではなく、モックが使われていることを証明する。

### 実装

```typescript
test("存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する", async () => {
  const queryClient = getQueryClient();
  queryClient.clear();

  const { router } = renderRouter({ initialLocation: "/" });
  const user = userEvent.setup();

  const combobox = await screen.findByRole("combobox", {
    name: /ユーザID検索/i,
  });

  // ✅ データロード完了時点でmockが呼ばれているはず（実APIを叩いていない証明）
  expect(mockGetAllUserIds).toHaveBeenCalled();
  expect(mockGetUserById).not.toHaveBeenCalled();

  const callCountBefore = mockGetUserById.mock.calls.length;

  await user.click(combobox);
  await user.clear(combobox);
  await user.paste("sample_id");
  await userEvent.click(document.body);

  const submitButton = await screen.findByRole("button", {
    name: "検索",
  });
  await user.click(submitButton);

  // ✅ 遷移完了を待つ（URLが変わるまで）
  await vi.waitFor(() => {
    expect(router.state.location.pathname).toBe("/cards/sample_id");
  });

  // ✅ mockGetUserByIdが呼ばれたことを確認（実APIを叩いていない証明）
  expect(mockGetUserById).toHaveBeenCalledWith("sample_id");
  expect(mockGetUserById.mock.calls.length).toBeGreaterThan(callCountBefore);

  // ✅ ユーザー名が表示されていることを確認
  expect(await screen.findByText("Sample User")).toBeInTheDocument();
});
```

## 最終結果

```bash
✓ tests/routes/index.test.tsx (6 tests) 1039ms
  ✓ ホームページテスト > レンダリングテスト > ホームページが正しく表示される 361ms
  ✓ ホームページテスト > レンダリングテスト > ペンディングコンポーネントが表示される 10ms
  ✓ ホームページテスト > ID検索フォームテスト > IDを入力せず検索ボタンを押すとユーザーIDを入力してください。と表示される 368ms
  ✓ ホームページテスト > ID検索フォームテスト > 存在しないIDを入力して検索ボタンを押すと「存在しないユーザーIDです」と表示される 115ms
  ✓ ホームページテスト > ID検索フォームテスト > 存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する 127ms
  ✓ ホームページテスト > 新しい名刺を登録ボタンを押して、/cards/registerへ遷移する 58ms

Test Files  1 passed (1)
Tests  6 passed (6)
```

### 改善ポイント

- ✅ **実行時間**: 1031ms → 127ms（約8倍高速化）
- ✅ **安定性**: 全テスト成功、再現性100%
- ✅ **信頼性**: モック呼び出しを検証して実APIを叩いていないことを確認

## 学んだこと

### 1. モックの初期化方法

```typescript
// ❌ 避けるべき
beforeEach(() => {
  vi.clearAllMocks(); // 実装もクリアされる
  mockFn.mockResolvedValue(data); // この設定が無効化される
});

// ✅ 推奨
beforeEach(() => {
  mockFn.mockClear(); // 呼び出し履歴だけクリア
  mockFn.mockResolvedValue(data); // 実装は有効
});
```

### 2. TanStack Queryのキャッシュ管理

```typescript
// テスト間でキャッシュが残る場合
test("test1", async () => {
  const queryClient = getQueryClient();
  queryClient.clear(); // キャッシュクリア
  // ...
});
```

### 3. userEventの入力方法

```typescript
// リアルなユーザー操作を再現
await user.type(input, "text");

// 確実に値を設定（高速）
await user.paste("text");
```

### 4. モック呼び出しの検証

```typescript
// モックが呼ばれたことを確認
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith("expected-arg");
expect(mockFn.mock.calls.length).toBeGreaterThan(0);
```

## まとめ

TanStack QueryのAPIモック化では、以下の点に注意が必要です：

1. **モック設定の基本**: 正しいパス、必要なインポート、データ設定
2. **モック初期化**: `mockClear()`で実装を保持
3. **キャッシュ管理**: `queryClient.clear()`でテスト間のキャッシュクリア
4. **入力方法**: 目的に応じて`type()`と`paste()`を使い分け
5. **検証**: モック呼び出しを確認して実APIを叩いていないことを証明

これらのポイントを押さえることで、安定した高速なテストを書くことができます。

## 参考リンク

- [TanStack Query - Testing](https://tanstack.com/query/latest/docs/framework/react/guides/testing)
- [Vitest - Mocking](https://vitest.dev/guide/mocking.html)
- [Testing Library - User Event](https://testing-library.com/docs/user-event/intro/)
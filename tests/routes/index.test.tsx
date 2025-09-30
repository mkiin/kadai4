import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetAllUserIds = vi.fn();
const mockGetUserById = vi.fn();

vi.mock("@/routes/cards/-api/user-query", () => ({
  userIdsQueryOptions: () => ({
    queryKey: ["users"],
    queryFn: mockGetAllUserIds,
  }),
  userQueryOptions: (id: string) => ({
    queryKey: ["users", id],
    queryFn: () => mockGetUserById(id),
  }),
}));

describe("ホームページテスト", () => {
  beforeEach(() => {
    // モック呼び出し回数だけをリセット（実装は保持）
    mockGetAllUserIds.mockClear();
    mockGetUserById.mockClear();

    // デフォルトのモックデータを設定
    mockGetAllUserIds.mockResolvedValue([
      { userId: "apple" },
      { userId: "sample_id" },
    ]);
    // ユーザー詳細のモックデータを設定
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

  describe("レンダリングテスト", () => {
    test("ホームページが正しく表示される", async () => {
      renderRouter({ initialLocation: "/" });
      // TanStack Queryの非同期データ取得を待つ
      expect(await screen.findByText("名刺検索")).toBeInTheDocument();
      // モックが呼ばれたことを確認（実APIを叩いていないことの証明）
      expect(mockGetAllUserIds).toHaveBeenCalled();
    });

    test("ペンディングコンポーネントが表示される", async () => {
      const queryClient = getQueryClient();
      queryClient.clear();
      vi.mocked(mockGetAllUserIds).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve([{ userId: "apple" }, { userId: "sample_id" }]),
              100,
            ),
          ),
      );
      renderRouter({ initialLocation: "/" });
      // ペンディング状態を確認
      expect(
        await screen.findByText("ユーザーIDを取得中..."),
      ).toBeInTheDocument();
    });
  });
  describe("ID検索フォームテスト", () => {
    test("IDを入力せず検索ボタンを押すとユーザーIDを入力してください。と表示される", async () => {
      renderRouter({ initialLocation: "/" });

      const user = userEvent.setup();

      const submitButton = await screen.findByRole("button", {
        name: "検索",
      });
      await user.click(submitButton);

      expect(await screen.findByText("ユーザーIDを入力してください"));
    });
    test("存在しないIDを入力して検索ボタンを押すと「存在しないユーザーIDです」と表示される", async () => {
      renderRouter({ initialLocation: "/" });

      const user = userEvent.setup();

      const combobox = await screen.findByRole("combobox", {
        name: /ユーザID検索/i,
      });
      await user.click(combobox);
      await user.clear(combobox);
      await user.paste("ダミーID");

      // 入力が確実に反映されるまで待つ
      await vi.waitFor(() => {
        expect(combobox).toHaveValue("ダミーID");
      });

      const submitButton = screen.getByText("検索");
      await user.click(submitButton);

      expect(await screen.findByText("存在しないユーザーIDです"));
    });
    test("存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する", async () => {
      const queryClient = getQueryClient();
      queryClient.clear();

      const { router } = renderRouter({ initialLocation: "/" });
      const user = userEvent.setup();
      // コンボボックスが表示されるまで待つ（データロード完了）
      const combobox = await screen.findByRole("combobox", {
        name: /ユーザID検索/i,
      });

      // データロード完了時点でmockが呼ばれているはず
      expect(mockGetAllUserIds).toHaveBeenCalled();
      expect(mockGetUserById).not.toHaveBeenCalled();

      const callCountBefore = mockGetUserById.mock.calls.length;

      await user.click(combobox);
      await user.clear(combobox);
      await user.paste("sample_id");

      // 入力が確実に反映されるまで待つ
      await vi.waitFor(() => {
        expect(combobox).toHaveValue("sample_id");
      });

      await userEvent.click(document.body); // 別の要素をクリックしてフォーカスを外す。

      const submitButton = await screen.findByRole("button", {
        name: "検索",
      });
      await user.click(submitButton);

      // 遷移完了を待つ（URLが変わるまで）
      await vi.waitFor(() => {
        expect(router.state.location.pathname).toBe("/cards/sample_id");
      });

      // mockGetUserByIdが呼ばれたことを確認（実APIを叩いていない証明）
      expect(mockGetUserById).toHaveBeenCalledWith("sample_id");
      expect(mockGetUserById.mock.calls.length).toBeGreaterThan(
        callCountBefore,
      );

      // ユーザー名が表示されていることを確認
      expect(await screen.findByText("Sample User")).toBeInTheDocument();
    });
  });
  test("新しい名刺を登録ボタンを押して、/cards/registerへ遷移する", async () => {
    const { router } = renderRouter({ initialLocation: "/" });
    const user = userEvent.setup();
    const button = await screen.findByRole("button", {
      name: "新しい名刺を登録する",
    });
    await user.click(button);
    expect(router.state.location.pathname).toBe("/cards/register");
  });
});

/* ホームページでテストすること */
/**
 * 1. レンダリングできているか
 * 1.1. pendingCompoentの"ユーザIDを取得中..."が表示されているか
 * 1.2. "名刺検索"が表示されているか
 * 2. ID検索フォームテスト
 *  2.1. IDを入力せず、検索ボタンを押すと"ユーザIDを入力してください。"と表示される
 *  2.2. 存在しないIDを検索すると"存在しないユーザーIDです"と表示される
 *  2.3. 存在するID"apple"を入力して、"名刺を見に行く"ボタンを押すと /cards/appleへ遷移する
 * 3. 新しい名刺を登録ボタンを押して、/cards/registerに遷移できるか。
 */

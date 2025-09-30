import type { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createTestQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetUserById = vi.fn();
const mockGetAllUserIds = vi.fn();

vi.mock("@/routes/cards/-api/user-query", () => ({
  userQueryOptions: (id: string) => ({
    queryKey: ["users", id],
    queryFn: () => mockGetUserById(id),
  }),
  userIdsQueryOptions: () => ({
    queryKey: ["users"],
    queryFn: mockGetAllUserIds,
  }),
}));

describe("名刺詳細ページ(/cards/$id)テスト", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // ✅ 各テストで新しいQueryClientを作成
    queryClient = createTestQueryClient();

    // モックをクリア
    mockGetUserById.mockClear();
    mockGetAllUserIds.mockClear();

    // デフォルトのモックデータ（全SNS情報あり）
    mockGetUserById.mockResolvedValue({
      user_id: "test_user",
      name: "テストユーザー",
      description: "これはテスト用の自己紹介文です。",
      github_id: "test_github",
      qiita_id: "test_qiita",
      x_id: "test_twitter",
      user_skill: [
        {
          skills: {
            skill_id: 1,
            name: "React",
          },
        },
        {
          skills: {
            skill_id: 2,
            name: "TypeScript",
          },
        },
        {
          skills: {
            skill_id: 3,
            name: "Vitest",
          },
        },
      ],
    });

    // userIdsQueryOptionsのモックデータも設定
    mockGetAllUserIds.mockResolvedValue([
      { userId: "test_user" },
      { userId: "sample_id" },
    ]);
  });

  afterEach(() => {
    // キャッシュをクリアしない - clearはCancelledErrorの原因
    // 各テストでcreateTestQueryClient()により新しいインスタンスを作成するため不要
  });

  describe("レンダリングテスト", () => {
    test("名前が表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      expect(await screen.findByText("テストユーザー")).toBeInTheDocument();
    });

    test("自己紹介が表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      expect(
        await screen.findByText("これはテスト用の自己紹介文です。"),
      ).toBeInTheDocument();
    });

    test("技術が表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      // 3つの技術バッジがすべて表示されることを確認
      expect(await screen.findByText("React")).toBeInTheDocument();
      expect(await screen.findByText("TypeScript")).toBeInTheDocument();
      expect(await screen.findByText("Vitest")).toBeInTheDocument();
    });

    test("ペンディングコンポーネントが表示される", async () => {
      // 遅延を追加してペンディング状態を確認
      mockGetUserById.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  user_id: "test_user",
                  name: "テストユーザー",
                  description: "テスト",
                  github_id: null,
                  qiita_id: null,
                  x_id: null,
                  user_skill: [],
                }),
              100,
            ),
          ),
      );

      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      // ペンディング状態を確認
      expect(
        await screen.findByText("名刺情報を読み込み中..."),
      ).toBeInTheDocument();
    });
  });

  describe("SNSアイコン表示テスト", () => {
    test("GitHubアイコンが表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      // GitHubアイコンのaria-labelで検索
      const githubButton = await screen.findByRole("button", {
        name: "GitHub",
      });
      expect(githubButton).toBeInTheDocument();

      // リンクが正しいことを確認
      const link = githubButton.closest("a");
      expect(link).toHaveAttribute("href", "https://github.com//test_github");
    });

    test("Qiitaアイコンが表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      const qiitaButton = await screen.findByRole("button", { name: "Qiita" });
      expect(qiitaButton).toBeInTheDocument();

      const link = qiitaButton.closest("a");
      expect(link).toHaveAttribute("href", "https://qiita.com/test_qiita");
    });

    test("X (Twitter)アイコンが表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      const twitterButton = await screen.findByRole("button", {
        name: "X (Twitter)",
      });
      expect(twitterButton).toBeInTheDocument();

      const link = twitterButton.closest("a");
      expect(link).toHaveAttribute("href", "https://x.com/test_twitter");
    });

    test("SNS情報がない場合、アイコンが表示されない", async () => {
      // SNS情報なしのモックデータ
      mockGetUserById.mockResolvedValueOnce({
        user_id: "no_sns_user",
        name: "SNSなしユーザー",
        description: "SNSなし",
        github_id: null,
        qiita_id: null,
        x_id: null,
        user_skill: [],
      });

      renderRouter({
        initialLocation: "/cards/no_sns_user",
        queryClient,
      });

      // 名前が表示されるまで待つ
      await screen.findByText("SNSなしユーザー");

      // アイコンが表示されないことを確認
      expect(
        screen.queryByRole("button", { name: "GitHub" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Qiita" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "X (Twitter)" }),
      ).not.toBeInTheDocument();
    });

    test("GitHubのみある場合、GitHubアイコンのみ表示される", async () => {
      mockGetUserById.mockResolvedValueOnce({
        user_id: "github_only",
        name: "GitHub Only",
        description: "GitHub only user",
        github_id: "github_user",
        qiita_id: null,
        x_id: null,
        user_skill: [],
      });

      renderRouter({
        initialLocation: "/cards/github_only",
        queryClient,
      });

      await screen.findByText("GitHub Only");

      expect(
        screen.getByRole("button", { name: "GitHub" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Qiita" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "X (Twitter)" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("ナビゲーションテスト", () => {
    test("「ユーザー検索に戻る」ボタンをクリックすると/に遷移する", async () => {
      const { router } = renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });
      const user = userEvent.setup();

      // ボタンが表示されるまで待つ
      const backButton = await screen.findByRole("button", {
        name: "ユーザー検索に戻る",
      });

      await user.click(backButton);

      // 遷移を待つ
      await vi.waitFor(() => {
        expect(router.state.location.pathname).toBe("/");
      });
    });

    test("「新しい名刺を登録」ボタンをクリックすると/cards/registerに遷移する", async () => {
      const { router } = renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });
      const user = userEvent.setup();

      const registerButton = await screen.findByRole("button", {
        name: "新しい名刺を登録",
      });

      await user.click(registerButton);

      await vi.waitFor(() => {
        expect(router.state.location.pathname).toBe("/cards/register");
      });
    });
  });

  describe("技術バッジのテスト", () => {
    test("技術が0個の場合、技術セクションが表示されない", async () => {
      mockGetUserById.mockResolvedValueOnce({
        user_id: "no_skills",
        name: "スキルなし",
        description: "技術なし",
        github_id: null,
        qiita_id: null,
        x_id: null,
        user_skill: [],
      });

      renderRouter({
        initialLocation: "/cards/no_skills",
        queryClient,
      });

      await screen.findByText("スキルなし");

      // 「好きな技術」というテキストが表示されないことを確認
      expect(screen.queryByText("好きな技術")).not.toBeInTheDocument();
    });

    test("複数の技術が正しく表示される", async () => {
      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      // 「好きな技術」セクションが表示される
      expect(await screen.findByText("好きな技術")).toBeInTheDocument();

      // 各技術が表示される
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("Vitest")).toBeInTheDocument();
    });
  });

  describe("モック呼び出し確認", () => {
    test("mockGetUserByIdが正しいIDで呼ばれることを確認", async () => {
      mockGetUserById.mockClear();

      renderRouter({
        initialLocation: "/cards/test_user",
        queryClient,
      });

      await screen.findByText("テストユーザー");

      // モックが正しいIDで呼ばれたことを確認
      expect(mockGetUserById).toHaveBeenCalledWith("test_user");
      expect(mockGetUserById).toHaveBeenCalledTimes(1);
    });
  });
});

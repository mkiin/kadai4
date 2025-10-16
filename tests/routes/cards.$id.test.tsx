import type { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockSkills, mockUsers, mockUsersList } from "../mocks";
import { createTestQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetUserById = vi.fn();
const mockGetAllUsers = vi.fn();
const mockGetAllSkills = vi.fn();

vi.mock("@/routes/cards/-api/user-query", () => ({
  userQueryOptions: (id: string) => ({
    queryKey: ["users", id],
    queryFn: () => mockGetUserById(id),
  }),
  getAllUsersOption: () => ({
    queryKey: ["users"],
    queryFn: mockGetAllUsers,
  }),
}));

vi.mock("@/routes/cards/-api/skill-query", () => ({
  skillsOptions: () => ({
    queryKey: ["skills"],
    queryFn: mockGetAllSkills,
  }),
}));

describe("名刺詳細ページ(/cards/$id)テスト", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // 各テストで新しいQueryClientを作成
    queryClient = createTestQueryClient();

    // モックをクリア
    mockGetUserById.mockClear();
    mockGetAllUsers.mockClear();
    mockGetAllSkills.mockClear();

    // デフォルトのモックデータ（全SNS情報あり）
    mockGetUserById.mockResolvedValue(mockUsers.fullProfile);

    // getAllUsersのモックデータも設定
    mockGetAllUsers.mockResolvedValue(mockUsersList);

    // skillsのモックデータも設定
    mockGetAllSkills.mockResolvedValue(mockSkills);
  });

  describe("レンダリングテスト", () => {
    test("名前が表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/1",
        queryClient,
      });

      expect(await screen.findByText(mockUsers.fullProfile.name)).toBeInTheDocument();
    });

    test("自己紹介が表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/1",
        queryClient,
      });

      expect(
        await screen.findByText(mockUsers.fullProfile.description),
      ).toBeInTheDocument();
    });

    test("技術が表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/1",
        queryClient,
      });

      // 技術バッジが表示されることを確認
      expect(await screen.findByText(mockSkills[0].name)).toBeInTheDocument();
    });

    test("ペンディングコンポーネントが表示される", async () => {
      // 遅延を追加してペンディング状態を確認
      mockGetUserById.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockUsers.noSocialMedia), 100),
          ),
      );

      renderRouter({
        initialLocation: "/cards/1",
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
        initialLocation: "/cards/1",
        queryClient,
      });

      // GitHubリンクを検索
      const githubLink = await screen.findByRole("link", {
        name: /github/i,
      });
      expect(githubLink).toBeInTheDocument();

      // リンクが正しいことを確認
      expect(githubLink).toHaveAttribute(
        "href",
        `https://github.com//${mockUsers.fullProfile.github_id}`,
      );
    });

    test("Qiitaアイコンが表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/1",
        queryClient,
      });

      const qiitaLink = await screen.findByRole("link", {
        name: /qiita/i,
      });
      expect(qiitaLink).toBeInTheDocument();

      expect(qiitaLink).toHaveAttribute("href", `https://qiita.com/${mockUsers.fullProfile.qiita_id}`);
    });

    test("X (Twitter)アイコンが表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/1",
        queryClient,
      });

      const twitterLink = await screen.findByRole("link", {
        name: /twitter/i,
      });
      expect(twitterLink).toBeInTheDocument();

      expect(twitterLink).toHaveAttribute("href", `https://x.com/${mockUsers.fullProfile.x_id}`);
    });
  });

  describe("ナビゲーションテスト", () => {
    test("「ユーザー検索に戻る」ボタンをクリックすると/に遷移する", async () => {
      const { router } = renderRouter({
        initialLocation: "/cards/1",
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
        initialLocation: "/cards/1",
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
      mockGetUserById.mockResolvedValueOnce(mockUsers.noSkills);

      renderRouter({
        initialLocation: "/cards/3",
        queryClient,
      });

      await screen.findByText(mockUsers.noSkills.name);

      // 「好きな技術」というテキストが表示されないことを確認
      expect(screen.queryByText("好きな技術")).not.toBeInTheDocument();
    });
  });

  describe("モック呼び出し確認", () => {
    test("mockGetUserByIdが正しいIDで呼ばれることを確認", async () => {
      mockGetUserById.mockClear();

      renderRouter({
        initialLocation: "/cards/1",
        queryClient,
      });

      await screen.findByText(mockUsers.fullProfile.name);

      // モックが正しいIDで呼ばれたことを確認
      expect(mockGetUserById).toHaveBeenCalledWith("1");
      expect(mockGetUserById).toHaveBeenCalledTimes(1);
    });
  });
});

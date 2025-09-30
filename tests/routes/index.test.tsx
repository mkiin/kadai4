import type { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createTestQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetAllUserIds = vi.fn();
const mockGetUserById = vi.fn();
const mockGetAllSkills = vi.fn();

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

vi.mock("@/routes/cards/-api/skill-query", () => ({
  skillsOptions: () => ({
    queryKey: ["skills"],
    queryFn: mockGetAllSkills,
  }),
}));

describe("ホームページテスト", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // ✅ 各テストで新しいQueryClientを作成
    queryClient = createTestQueryClient();

    // モック呼び出し回数だけをリセット
    mockGetAllUserIds.mockClear();
    mockGetUserById.mockClear();
    mockGetAllSkills.mockClear();

    // デフォルトのモックデータを設定
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

    mockGetAllSkills.mockResolvedValue([
      { skillId: 1, name: "React" },
      { skillId: 2, name: "TypeScript" },
      { skillId: 3, name: "Vitest" },
    ]);
  });

  afterEach(() => {
    // キャッシュをクリアしない - clearはCancelledErrorの原因
    // 各テストでcreateTestQueryClient()により新しいインスタンスを作成するため不要
  });

  describe("レンダリングテスト", () => {
    test("ホームページが正しく表示される", async () => {
      renderRouter({
        initialLocation: "/",
        queryClient, // ✅ 新しいQueryClientを渡す
      });

      expect(await screen.findByText("名刺検索")).toBeInTheDocument();
      expect(mockGetAllUserIds).toHaveBeenCalled();
    });

    test("ペンディングコンポーネントが表示される", async () => {
      mockGetAllUserIds.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve([{ userId: "apple" }, { userId: "sample_id" }]),
              100,
            ),
          ),
      );

      renderRouter({
        initialLocation: "/",
        queryClient,
      });

      expect(
        await screen.findByText("ユーザーIDを取得中..."),
      ).toBeInTheDocument();
    });
  });

  describe("ID検索フォームテスト", () => {
    test("IDを入力せず検索ボタンを押すとユーザーIDを入力してください。と表示される", async () => {
      renderRouter({
        initialLocation: "/",
        queryClient,
      });

      const user = userEvent.setup();

      const submitButton = await screen.findByRole("button", {
        name: "検索",
      });
      await user.click(submitButton);

      expect(
        await screen.findByText("ユーザーIDを入力してください"),
      ).toBeInTheDocument();
    });

    test("存在しないIDを入力して検索ボタンを押すと「存在しないユーザーIDです」と表示される", async () => {
      renderRouter({
        initialLocation: "/",
        queryClient,
      });

      const user = userEvent.setup();

      const combobox = await screen.findByRole("combobox", {
        name: /ユーザID検索/i,
      });
      await user.click(combobox);
      await user.clear(combobox);
      await user.paste("ダミーID");

      await vi.waitFor(() => {
        expect(combobox).toHaveValue("ダミーID");
      });

      const submitButton = screen.getByText("検索");
      await user.click(submitButton);

      expect(
        await screen.findByText("存在しないユーザーIDです"),
      ).toBeInTheDocument();
    });

    test("存在するID「sample_id」を入力して、検索ボタンを押すと /cards/sample_idへ遷移する", async () => {
      const { router } = renderRouter({
        initialLocation: "/",
        queryClient,
      });

      const user = userEvent.setup();

      const combobox = await screen.findByRole("combobox", {
        name: /ユーザID検索/i,
      });

      expect(mockGetAllUserIds).toHaveBeenCalled();
      expect(mockGetUserById).not.toHaveBeenCalled();

      const callCountBefore = mockGetUserById.mock.calls.length;

      await user.click(combobox);
      await user.clear(combobox);
      await user.paste("sample_id");
      const submitButton = await screen.findByRole("button", { name: "検索" });

      await vi.waitFor(() => {
        expect(combobox).toHaveValue("sample_id");
      });

      await user.click(submitButton);

      await vi.waitFor(() => {
        expect(router.state.location.pathname).toBe("/cards/sample_id");
      });

      expect(mockGetUserById).toHaveBeenCalledWith("sample_id");
      expect(mockGetUserById.mock.calls.length).toBeGreaterThan(
        callCountBefore,
      );

      expect(await screen.findByText("Sample User")).toBeInTheDocument();
    });
  });

  test("新しい名刺を登録ボタンを押して、/cards/registerへ遷移する", async () => {
    const { router } = renderRouter({
      initialLocation: "/",
      queryClient,
    });

    const user = userEvent.setup();
    const button = await screen.findByRole("button", {
      name: "新しい名刺を登録する",
    });
    await user.click(button);

    expect(router.state.location.pathname).toBe("/cards/register");
  });
});

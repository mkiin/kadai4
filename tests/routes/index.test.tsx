import type { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockSkills, mockUsers, mockUsersList } from "../mocks";
import { createTestQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetAllUsers = vi.fn();
const mockGetUserById = vi.fn();
const mockGetAllSkills = vi.fn();

vi.mock("@/routes/cards/-api/user-query", () => ({
  getAllUsersOption: () => ({
    queryKey: ["users"],
    queryFn: mockGetAllUsers,
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
    mockGetAllUsers.mockClear();
    mockGetUserById.mockClear();
    mockGetAllSkills.mockClear();

    // デフォルトのモックデータを設定
    mockGetAllUsers.mockResolvedValue(mockUsersList);

    mockGetUserById.mockResolvedValue(mockUsers.noSocialMedia);

    mockGetAllSkills.mockResolvedValue(mockSkills);
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
      expect(mockGetAllUsers).toHaveBeenCalled();
    });

    test("ペンディングコンポーネントが表示される", async () => {
      mockGetAllUsers.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockUsersList), 100),
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

  describe("名前検索フォームテスト", () => {
    test("名前を入力せず検索ボタンを押すとユーザー名を入力してください。と表示される", async () => {
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
        await screen.findByText("ユーザー名を入力してください"),
      ).toBeInTheDocument();
    });

    test("存在しない名前を入力して検索ボタンを押すと「存在しないユーザー名です」と表示される", async () => {
      renderRouter({
        initialLocation: "/",
        queryClient,
      });

      const user = userEvent.setup();

      const combobox = await screen.findByRole("combobox", {
        name: /ユーザー名検索/i,
      });
      await user.click(combobox);
      await user.clear(combobox);
      await user.paste("存在しない名前");

      await vi.waitFor(() => {
        expect(combobox).toHaveValue("存在しない名前");
      });

      const submitButton = screen.getByText("検索");
      await user.click(submitButton);

      expect(
        await screen.findByText("存在しないユーザー名です"),
      ).toBeInTheDocument();
    });

    test(`存在する名前「${mockUsers.noSocialMedia.name}」を入力して、検索ボタンを押すと /cards/2へ遷移する`, async () => {
      const { router } = renderRouter({
        initialLocation: "/",
        queryClient,
      });

      const user = userEvent.setup();
      const submitButton = await screen.findByRole("button", { name: "検索" });

      const combobox = await screen.findByRole("combobox");

      expect(mockGetAllUsers).toHaveBeenCalled();
      expect(mockGetUserById).not.toHaveBeenCalled();

      const callCountBefore = mockGetUserById.mock.calls.length;

      await user.click(combobox);
      await user.clear(combobox);
      await user.paste(mockUsers.noSocialMedia.name);

      await vi.waitFor(() => {
        expect(combobox).toHaveValue(mockUsers.noSocialMedia.name);
      });

      await user.click(submitButton);

      await vi.waitFor(() => {
        expect(router.state.location.pathname).toBe("/cards/2");
      });

      expect(mockGetUserById).toHaveBeenCalledWith("2");
      expect(mockGetUserById.mock.calls.length).toBeGreaterThan(
        callCountBefore,
      );

      expect(await screen.findByText(mockUsers.noSocialMedia.name)).toBeInTheDocument();
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

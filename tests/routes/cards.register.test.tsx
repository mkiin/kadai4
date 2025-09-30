import type { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createTestQueryClient, renderRouter } from "../utils/file-route-utils";

const mockGetAllSkills = vi.fn();
const mockCreateUser = vi.fn();
const mockGetAllUserIds = vi.fn();

vi.mock("@/routes/cards/-api/skill-query", () => ({
  skillsOptions: () => ({
    queryKey: ["skills"],
    queryFn: mockGetAllSkills,
  }),
}));

vi.mock("@/routes/cards/-api/user", () => ({
  createUser: (data: unknown) => mockCreateUser(data),
  getAllUserIds: () => mockGetAllUserIds(),
}));

describe("名刺登録ページ(/cards/register)テスト", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // 各テストで新しいQueryClientを作成
    queryClient = createTestQueryClient();

    // モックをクリア
    mockGetAllSkills.mockClear();
    mockCreateUser.mockClear();
    mockGetAllUserIds.mockClear();

    // デフォルトのモックデータ
    mockGetAllSkills.mockResolvedValue([
      { skillId: 1, name: "React" },
      { skillId: 2, name: "TypeScript" },
      { skillId: 3, name: "Vitest" },
    ]);

    mockGetAllUserIds.mockResolvedValue([]);

    mockCreateUser.mockResolvedValue(undefined);
  });

  afterEach(() => {
    // キャッシュをクリアしない - clearはCancelledErrorの原因
    // 各テストでcreateTestQueryClient()により新しいインスタンスを作成するため不要
  });

  describe("レンダリングテスト", () => {
    test("タイトルが表示されている", async () => {
      renderRouter({
        initialLocation: "/cards/register",
        queryClient,
      });

      expect(await screen.findByText("新規名刺登録")).toBeInTheDocument();
    });
  });

  describe("全項目入力テスト", () => {
    test("全項目入力して登録ボタンを押すと/に遷移する", async () => {
      const { router } = renderRouter({
        initialLocation: "/cards/register",
        queryClient,
      });
      const user = userEvent.setup();

      // タイトルが表示されるまで待つ
      await screen.findByText("新規名刺登録");

      // 好きな単語を入力
      const likeWordInput = screen.getByLabelText("好きな単語");
      await user.click(likeWordInput);
      await user.paste("test_word");

      // 名前を入力
      const nameInput = screen.getByLabelText("名前");
      await user.click(nameInput);
      await user.paste("テストユーザー");

      // 自己紹介を入力
      const descriptionInput = screen.getByLabelText("自己紹介");
      await user.click(descriptionInput);
      await user.paste("これはテスト用の自己紹介です");

      // 登録ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      // 遷移を待つ
      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/");
      });

      // createUserが呼ばれたことを確認
      expect(mockCreateUser).toHaveBeenCalledWith({
        likeWord: "test_word",
        name: "テストユーザー",
        desctiption: "これはテスト用の自己紹介です",
        skills: [],
        githubId: "",
        qiitaId: "",
        xId: "",
      });
    });
  });

  describe("バリデーションテスト", () => {
    test("IDがないときにエラーメッセージがでる", async () => {
      renderRouter({
        initialLocation: "/cards/register",
        queryClient,
      });
      const user = userEvent.setup();

      await screen.findByText("新規名刺登録");

      // 名前を入力
      const nameInput = screen.getByLabelText("名前");
      await user.click(nameInput);
      await user.paste("テストユーザー");

      // 自己紹介を入力
      const descriptionInput = screen.getByLabelText("自己紹介");
      await user.click(descriptionInput);
      await user.paste("これはテスト用の自己紹介です");

      // 登録ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      // エラーメッセージが表示されることを確認
      expect(
        await screen.findByText("内容の入力は必須です"),
      ).toBeInTheDocument();

      // createUserが呼ばれないことを確認
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test("名前がないときにエラーメッセージがでる", async () => {
      renderRouter({
        initialLocation: "/cards/register",
        queryClient,
      });
      const user = userEvent.setup();

      await screen.findByText("新規名刺登録");

      // 好きな単語を入力
      const likeWordInput = screen.getByLabelText("好きな単語");
      await user.click(likeWordInput);
      await user.paste("test_word");

      // 自己紹介を入力
      const descriptionInput = screen.getByLabelText("自己紹介");
      await user.click(descriptionInput);
      await user.paste("これはテスト用の自己紹介です");

      // 登録ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      // エラーメッセージが表示されることを確認
      expect(
        await screen.findByText("内容の入力は必須です"),
      ).toBeInTheDocument();

      // createUserが呼ばれないことを確認
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test("紹介文がないときにエラーメッセージがでる", async () => {
      renderRouter({
        initialLocation: "/cards/register",
        queryClient,
      });
      const user = userEvent.setup();

      await screen.findByText("新規名刺登録");

      // 好きな単語を入力
      const likeWordInput = screen.getByLabelText("好きな単語");
      await user.click(likeWordInput);
      await user.paste("test_word");

      // 名前を入力
      const nameInput = screen.getByLabelText("名前");
      await user.click(nameInput);
      await user.paste("テストユーザー");

      // 登録ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      // エラーメッセージが表示されることを確認
      expect(
        await screen.findByText("内容の入力は必須です"),
      ).toBeInTheDocument();

      // createUserが呼ばれないことを確認
      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  describe("オプション項目テスト", () => {
    test("オプションを入力しなくても登録ができる", async () => {
      const { router } = renderRouter({
        initialLocation: "/cards/register",
        queryClient,
      });
      const user = userEvent.setup();

      await screen.findByText("新規名刺登録");

      // 必須項目のみ入力
      const likeWordInput = screen.getByLabelText("好きな単語");
      await user.click(likeWordInput);
      await user.paste("test_word");

      const nameInput = screen.getByLabelText("名前");
      await user.click(nameInput);
      await user.paste("テストユーザー");

      const descriptionInput = screen.getByLabelText("自己紹介");
      await user.click(descriptionInput);
      await user.paste("これはテスト用の自己紹介です");

      // 登録ボタンをクリック
      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      // 遷移を待つ
      await waitFor(() => {
        expect(router.state.location.pathname).toBe("/");
      });

      // createUserが呼ばれたことを確認
      expect(mockCreateUser).toHaveBeenCalledWith({
        likeWord: "test_word",
        name: "テストユーザー",
        desctiption: "これはテスト用の自己紹介です",
        skills: [],
        githubId: "",
        qiitaId: "",
        xId: "",
      });
    });
  });
});

import type { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
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

  // describe("レンダリングテスト", () => {
  //   test("タイトルが表示されている", async () => {
  //     renderRouter({
  //       initialLocation: "/cards/register",
  //       queryClient,
  //     });
  //     // await waitFor(() => {});
  //     // expect(screen.getByText("新規名刺登録")).toBeInTheDocument();
  //   });
  // });

  describe("全項目入力テスト", () => {
    test("全項目入力して登録ボタンを押すと/に遷移する", async () => {
      const { router } = renderRouter({
        initialLocation: "/cards/register",
        queryClient,
      });

      const user = userEvent.setup();

      const submitButton = await screen.findByRole("button", { name: "登録" });

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

      // 好きな技術を選択
      const skillTrigger = screen.getByText("技術を選択してください");
      await user.click(skillTrigger);
      const reactOption = await screen.findByRole("option", { name: "React" });
      await user.click(reactOption);

      // 登録ボタンをクリック
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
        skillId: "1",
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
      const submitButton = await screen.findByRole("button", { name: "登録" });
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
      const submitButton = await screen.findByRole("button", { name: "登録" });
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
      const submitButton = await screen.findByRole("button", { name: "登録" });
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

      const submitButton = await screen.findByRole("button", { name: "登録" });

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

      // 好きな技術を選択
      const skillTrigger = screen.getByText("技術を選択してください");
      await user.click(skillTrigger);
      const reactOption = await screen.findByRole("option", { name: "React" });
      await user.click(reactOption);

      // 登録ボタンをクリック
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
        skillId: "1",
        githubId: "",
        qiitaId: "",
        xId: "",
      });
    });
  });
});

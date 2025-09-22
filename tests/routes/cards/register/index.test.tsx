import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "tests/utils/render";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as userApi from "@/routes/cards/-api/user";
import { UserRegisterPage } from "@/routes/cards/register/index";

// Supabase関数をモック
vi.mock("@/routes/cards/-api/user", () => ({
  createUser: vi.fn(),
  getAllUser: vi.fn(),
  getAllUserIds: vi.fn(),
  getUserById: vi.fn(),
}));

// useNavigateをモック
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

// skillsOptionsをモック
vi.mock("@/routes/cards/-api/skill-query", () => ({
  skillsOptions: () => ({
    queryKey: ["skills"],
    queryFn: () =>
      Promise.resolve([
        { skillId: 1, name: "React" },
        { skillId: 2, name: "TypeScript" },
        { skillId: 3, name: "Node.js" },
        { skillId: 4, name: "GraphQL" },
      ]),
  }),
}));

// useSuspenseQueryをモック
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useSuspenseQuery: () => ({
      data: [
        { skillId: 1, name: "React" },
        { skillId: 2, name: "TypeScript" },
        { skillId: 3, name: "Node.js" },
        { skillId: 4, name: "GraphQL" },
      ],
    }),
  };
});

describe("登録ページ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("名刺登録ページのタイトルが表示されているか", () => {
    render(<UserRegisterPage />);
    expect(screen.getByText("新規名刺登録")).toBeInTheDocument();
    expect(
      screen.getByText("あなたの情報を入力して、名刺を作成しましょう"),
    ).toBeInTheDocument();
  });

  it("全項目入力して登録ボタンを押すと/に遷移する", async () => {
    const user = userEvent.setup();
    const mockCreateUser = vi.mocked(userApi.createUser);
    mockCreateUser.mockResolvedValueOnce(undefined as any);

    render(<UserRegisterPage />);

    // 必須項目を入力
    await user.type(screen.getByLabelText("好きな単語"), "テスト単語");
    await user.type(screen.getByLabelText("名前"), "テスト太郎");
    await user.type(screen.getByLabelText("自己紹介"), "テストです");

    // 登録ボタンをクリック
    const submitButton = screen.getByRole("button", { name: "登録" });
    await user.click(submitButton);

    // navigateが正しいパスで呼ばれたか確認
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  it("IDがないときにエラーメッセージがでる", async () => {
    const user = userEvent.setup();
    render(<UserRegisterPage />);

    // 好きな単語フィールドにフォーカスして、何も入力せずにフォーカスを外す
    const likeWordInput = screen.getByLabelText("好きな単語");
    await user.click(likeWordInput);
    await user.tab(); // フォーカスを外す

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("内容の入力は必須です")).toBeInTheDocument();
    });
  });

  it("名前がないときにエラーメッセージがでる", async () => {
    const user = userEvent.setup();
    render(<UserRegisterPage />);

    // 名前フィールドにフォーカスして、何も入力せずにフォーカスを外す
    const nameInput = screen.getByLabelText("名前");
    await user.click(nameInput);
    await user.tab(); // フォーカスを外す

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("内容の入力は必須です")).toBeInTheDocument();
    });
  });

  it("紹介文がないときにエラーメッセージがでる", async () => {
    const user = userEvent.setup();
    render(<UserRegisterPage />);

    // 自己紹介フィールドにフォーカスして、何も入力せずにフォーカスを外す
    const descriptionInput = screen.getByLabelText("自己紹介");
    await user.click(descriptionInput);
    await user.tab(); // フォーカスを外す

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("内容の入力は必須です")).toBeInTheDocument();
    });
  });

  it("オプションを入力しなくても登録ができる", async () => {
    const user = userEvent.setup();
    const mockCreateUser = vi.mocked(userApi.createUser);
    mockCreateUser.mockResolvedValueOnce(undefined as any);

    render(<UserRegisterPage />);

    // 必須項目のみ入力（SNSアカウントは入力しない）
    await user.type(screen.getByLabelText("好きな単語"), "テスト単語");
    await user.type(screen.getByLabelText("名前"), "テスト太郎");
    await user.type(screen.getByLabelText("自己紹介"), "テストです");

    // 登録ボタンをクリック
    const submitButton = screen.getByRole("button", { name: "登録" });
    await user.click(submitButton);

    // navigateが正しく呼ばれたか確認
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  it("20文字を超える入力でエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    render(<UserRegisterPage />);

    // 21文字入力してエラーを確認
    const longText = "あ".repeat(21);
    const nameInput = screen.getByLabelText("名前");
    await user.type(nameInput, longText);
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("20文字以下で入力してください"),
      ).toBeInTheDocument();
    });
  });
});

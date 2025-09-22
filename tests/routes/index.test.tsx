import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "tests/utils/render";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/routes/index";

// useNavigateをモック
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

// userIdsQueryOptionsをモック
vi.mock("@/routes/cards/-api/user-query", () => ({
  userIdsQueryOptions: () => ({
    queryKey: ["userIds"],
    queryFn: () =>
      Promise.resolve([
        { userId: "user001" },
        { userId: "user002" },
        { userId: "user003" },
        { userId: "testUser" },
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
        { userId: "user001" },
        { userId: "user002" },
        { userId: "user003" },
        { userId: "testUser" },
      ],
    }),
  };
});

describe("トップページ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("タイトルが表示されている", () => {
    render(<App />);
    expect(screen.getByText("名刺検索")).toBeInTheDocument();
    expect(
      screen.getByText("ユーザーIDから名刺情報を検索できます")
    ).toBeInTheDocument();
  });

  it("IDを入力してボタンを押すと/cards/:idに遷移する", async () => {
    const user = userEvent.setup();
    render(<App />);

    // ユーザーIDを入力
    const input = screen.getByPlaceholderText("ユーザーIDを入力してください");
    await user.type(input, "testUser");

    // ボタンをクリック - テキストで探す
    const submitButton = screen.getByText("名刺を見に行く");
    await user.click(submitButton);

    // navigateが正しいパスで呼ばれたか確認
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/cards/testUser" });
    });
  });

  it("IDを入力しないでボタンを押すとエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 何も入力せずにボタンをクリック - テキストで探す
    const submitButton = screen.getByText("名刺を見に行く");
    await user.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(
        screen.getByText("ユーザーIDを入力してください")
      ).toBeInTheDocument();
    });
  });

  it("存在しないIDを入力するとエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    render(<App />);

    // 存在しないユーザーIDを入力
    const input = screen.getByPlaceholderText("ユーザーIDを入力してください");
    await user.type(input, "nonExistentUser");

    // ボタンをクリック - テキストで探す
    const submitButton = screen.getByText("名刺を見に行く");
    await user.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText("存在しないユーザーIDです")).toBeInTheDocument();
    });
  });

  it("新規登録はこちらを押すと/cards/registerに遷移する", () => {
    render(<App />);

    // 新規登録リンクを探す - テキストで探す
    const registerLink = screen.getByText("新しい名刺を登録する");

    // リンクが正しいパスを持っているか確認
    expect(registerLink.closest('a')).toHaveAttribute("href", "/cards/register");
  });

  it("ドロップダウンから選択してもIDが入力される", async () => {
    const user = userEvent.setup();
    render(<App />);

    // コンボボックスをクリックして開く
    const input = screen.getByPlaceholderText("ユーザーIDを入力してください");
    await user.click(input);

    // ドロップダウンからuser001を選択
    await user.type(input, "user001");

    // ボタンをクリック - テキストで探す
    const submitButton = screen.getByText("名刺を見に行く");
    await user.click(submitButton);

    // navigateが正しいパスで呼ばれたか確認
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/cards/user001" });
    });
  });
});
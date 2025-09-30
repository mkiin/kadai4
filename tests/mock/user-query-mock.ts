import { vi } from "vitest";
import { mockUserData } from "../mock/data";

// 外部API関数のモック
export const mockCreateUser = vi.fn();
export const mockGetUserById = vi
  .fn()
  .mockResolvedValue(mockUserData.sample_id);
export const mockGetAllUserIds = vi
  .fn()
  .mockResolvedValue([{ userId: "apple" }, { userId: "sample_id" }]);

// TanStack Query関連のモック
export const mockMutate = vi.fn();
export const mockMutateAsync = vi.fn();
export const mockInvalidateQueries = vi.fn();
export const mockSetQueryData = vi.fn();
export const mockGetQueryData = vi.fn();

export const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
  setQueryData: mockSetQueryData,
  getQueryData: mockGetQueryData,
  removeQueries: vi.fn(),
  clear: vi.fn(),
};

// useMutationの戻り値モック
export const mockUseMutationReturn = {
  mutate: mockMutate,
  mutateAsync: mockMutateAsync,
  isLoading: false,
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: null,
  reset: vi.fn(),
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  status: "idle" as const,
};

// モック設定
export const setupUserQueryMocks = () => {
  // 外部API関数をモック化
  vi.mock("@/routes/cards/-api/user", () => ({
    createUser: mockCreateUser,
    getUserById: mockGetUserById,
    getAllUserIds: mockGetAllUserIds,
  }));

  // TanStack Queryのフックをモック化
  vi.mock("@tanstack/react-query", () => ({
    useMutation: vi.fn().mockReturnValue(mockUseMutationReturn),
    useQueryClient: vi.fn().mockReturnValue(mockQueryClient),
    queryOptions: vi.fn().mockImplementation((options) => options),
    useQuery: vi.fn(),
    useSuspenseQuery: vi.fn(),
  }));

  // user-query.tsの関数をモック化
  vi.mock("@/routes/cards/-api/user-query", () => ({
    userQueryOptions: vi.fn().mockImplementation((id: string) => ({
      queryKey: ["users", id],
      queryFn: () => mockGetUserById(id),
    })),

    userIdsQueryOptions: vi.fn().mockImplementation(() => ({
      queryKey: ["users"],
      queryFn: mockGetAllUserIds,
    })),

    useUserRegisterMutation: vi.fn(),
  }));
};

// 特定のテスト用モック設定関数
export const mockUserRegisterMutation = (
  onSuccessCallback?: () => void,
  onErrorCallback?: (message: string) => void,
) => {
  const { useMutation } = require("@tanstack/react-query");
  const { useUserRegisterMutation } = require("@/routes/cards/-api/user-query");

  // useMutationの動作をモック
  vi.mocked(useMutation).mockImplementation(() => {
    return {
      ...mockUseMutationReturn,
      mutate: vi.fn().mockImplementation(async (data) => {
        try {
          await mockCreateUser(data);
          // onSuccessコールバックの実行をシミュレート
          mockInvalidateQueries({ queryKey: ["users"] });
          if (onSuccessCallback) onSuccessCallback();
        } catch (error) {
          if (onErrorCallback) {
            let errorMessage = "エラーが発生しました。";
            if (
              typeof error === "object" &&
              error !== null &&
              "code" in error &&
              error.code === "23505"
            ) {
              errorMessage = "好きな単語が重複しています。";
            }
            onErrorCallback(errorMessage);
          }
        }
      }),
    };
  });

  // useUserRegisterMutationのモック
  vi.mocked(useUserRegisterMutation).mockImplementation(
    () => vi.mocked(useMutation).mock.results[0].value,
  );
};

// モックリセット
export const resetAllMocks = () => {
  mockCreateUser.mockClear();
  mockGetUserById.mockClear();
  mockGetAllUserIds.mockClear();
  mockMutate.mockClear();
  mockMutateAsync.mockClear();
  mockInvalidateQueries.mockClear();
  mockSetQueryData.mockClear();
  mockGetQueryData.mockClear();

  // デフォルト値を再設定
  mockGetAllUserIds.mockResolvedValue([
    { userId: "apple" },
    { userId: "sample_id" },
  ]);
  mockGetUserById.mockResolvedValue(mockUserData.sample_id);
  mockCreateUser.mockResolvedValue({ success: true });
};

// テストシナリオ
export const mockScenarios = {
  success: () => {
    mockCreateUser.mockResolvedValue({ success: true });
    mockGetAllUserIds.mockResolvedValue([
      { userId: "apple" },
      { userId: "sample_id" },
    ]);
    mockGetUserById.mockResolvedValue(mockUserData.sample_id);
  },

  duplicateError: () => {
    const error = {
      code: "23505",
      details: "Key (like_word)=(test) already exists.",
    };
    mockCreateUser.mockRejectedValue(error);
  },

  generalError: () => {
    mockCreateUser.mockRejectedValue(new Error("Server error"));
  },
};

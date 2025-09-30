import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createUser, getAllUserIds, getUserById } from "./user";

export const userQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
  });
};

export const userIdsQueryOptions = () => {
  return queryOptions({
    queryKey: ["users"],
    queryFn: getAllUserIds,
  });
};

type UserRegisterFormData = {
  likeWord: string;
  name: string;
  desctiption: string;
  skills: string[];
  githubId?: string;
  qiitaId?: string;
  xId?: string;
};

export const useUserRegisterMutation = (
  onSuccessCallback?: () => void,
  onErrorCalllback?: (message: string) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserRegisterFormData) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      console.error(error);
      let errorMessage = "エラーが発生しました。";

      /* PostgresError用の処理のエラーメッセージを詰める */
      if (
        typeof error === "object" &&
        "code" in error &&
        "details" in error &&
        error.code === "23505"
      ) {
        errorMessage = "好きな単語が重複しています。";
      }

      if (onErrorCalllback) {
        onErrorCalllback(errorMessage);
      }
    },
  });
};

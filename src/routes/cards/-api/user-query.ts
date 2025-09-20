import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createUser, getAllUser, getAllUserIds, getUserById } from "./user";

export const usersQueryOptions = () =>
  queryOptions({ queryKey: ["users"], queryFn: getAllUser });

export const userQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
  });
};

export const userIdsQueryOptions = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: getAllUserIds,
  });

type UserRegisterFormData = {
  likeWord: string;
  name: string;
  desctiption: string;
  skills: string[];
  githubId?: string;
  qiitaId?: string;
  xId?: string;
};

export const useUserRegisterMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserRegisterFormData) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

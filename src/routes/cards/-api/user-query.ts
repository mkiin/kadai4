import { queryOptions } from "@tanstack/react-query";
import { getAllUser, getUserById } from "./user";

export const usersQueryOptions = () =>
  queryOptions({ queryKey: ["users"], queryFn: getAllUser });

export const userQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
  });
};

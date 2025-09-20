import { queryOptions } from "@tanstack/react-query";
import { getAllSkills } from "@/routes/cards/-api/skill";

export const skillsOptions = () => {
  return queryOptions({
    queryKey: ["skills"],
    queryFn: getAllSkills,
  });
};

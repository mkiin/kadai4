import { supabase } from "@/lib/supabase-client";

export const getAllSkills = async () => {
  const { data, error } = await supabase
    .from("skills")
    .select("skillId :skill_id, name");
  if (error) throw error;
  return data;
};

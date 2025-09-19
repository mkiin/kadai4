import { supabase } from "@/lib/supabase-client";

/**
 * @brief ユーザーテーブルから全ユーザーを取得する関数
 * @returns
 */
export const getAllUser = async () => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
};

/**
 * @biref IDに紐づいたユーザーデータを取得する関数
 * @param id ユーザーID
 * @returns ユーザーIDで指定したユーザーデータ
 */
export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from("users")
    .select(`*,
      user_skill!inner (
        skills (
          skill_id,
          name
        )
      )
    `)
    .eq("user_id", id)
    .single();
  if (error) throw error;
  // データを整形する
  return data;
};

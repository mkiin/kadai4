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

export type ReturnGetUserById = Awaited<ReturnType<typeof getUserById>>;

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
  return data;
};

export const getAllUserIds = async () => {
  const { data: result, error } = await supabase
    .from("users")
    .select("userId : user_id");

  if (error) throw error;
  return result;
};

type CreateUserData = {
  likeWord: string;
  name: string;
  desctiption: string;
  skillId: string;
  githubId?: string;
  qiitaId?: string;
  xId?: string;
};

export const createUser = async (data: CreateUserData) => {
  // ユーザー情報を挿入
  const { error: userError } = await supabase.from("users").insert({
    user_id: data.likeWord,
    name: data.name,
    description: data.desctiption,
    github_id: data.githubId,
    qiita_id: data.qiitaId,
    x_id: data.xId,
  });
  if (userError) throw userError;

  // スキルを挿入
  const { error: skillError } = await supabase.from("user_skill").insert({
    user_id: data.likeWord,
    skill_id: Number(data.skillId),
  });
  if (skillError) throw skillError;
};

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
    .eq("user_id", Number(id))
    .single();
  if (error) throw error;
  return data;
};

type CreateUserData = {
  name: string;
  desctiption: string;
  skillId: string;
  githubId?: string;
  qiitaId?: string;
  xId?: string;
};

export const createUser = async (data: CreateUserData) => {
  // ユーザー情報を挿入
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert({
      name: data.name,
      description: data.desctiption,
      github_id: data.githubId,
      qiita_id: data.qiitaId,
      x_id: data.xId,
    })
    .select()
    .single();
  if (userError) throw userError;

  // スキルを挿入
  const { error: skillError } = await supabase.from("user_skill").insert({
    user_id: Number(userData.user_id),
    skill_id: Number(data.skillId),
  });
  if (skillError) throw skillError;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, name")
    .order("user_id", { ascending: true });

  if (error) throw error;

  return data;
};

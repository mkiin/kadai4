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

type CreateUserData = {
  likeWord: string;
  name: string;
  desctiption: string;
  skills: string[];
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

  // スキルが選択されている場合のみuser_skillテーブルに挿入
  if (data.skills.length > 0) {
    const userSkillInserts = data.skills.map(skillId => ({
      user_id: data.likeWord,
      skill_id: Number(skillId),
    }));

    const { error: skillError } = await supabase
      .from("user_skill")
      .insert(userSkillInserts);
    if (skillError) throw skillError;
  }
};

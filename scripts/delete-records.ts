import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("環境変数が設定されていません");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("削除対象期間:");
    console.log("開始:", yesterday.toISOString());
    console.log("終了:", today.toISOString());

    // usersテーブルから削除
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .delete()
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString())
      .select();

    if (usersError) throw usersError;
    console.log(`✓ usersテーブル: ${usersData?.length || 0}件削除`);

    // user_skillテーブルから削除
    const { data: skillsData, error: skillsError } = await supabase
      .from("user_skill")
      .delete()
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString())
      .select();

    if (skillsError) throw skillsError;
    console.log(`✓ user_skillテーブル: ${skillsData?.length || 0}件削除`);

    console.log("削除処理が正常に完了しました");
  } catch (error) {
    console.error("予期しないエラー:", error);
    process.exit(1);
  }
}

main();

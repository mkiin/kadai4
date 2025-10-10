import { supabase } from "@/lib/supabase-client";

async function main() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("削除対象期間");
    console.log("開始", yesterday.toISOString());
    console.log("終了", today.toISOString());

    const { error: skillError } = await supabase
      .from("users")
      .delete()
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());

    if (skillError) throw skillError;

    const { error: useSkilError } = await supabase
      .from("user_skill")
      .delete()
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());
    if (useSkilError) throw useSkilError;
  } catch (error) {
    console.error("予期しないエラー", error);
    process.exit(1);
  }
}

main();

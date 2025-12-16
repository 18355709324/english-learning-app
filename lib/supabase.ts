import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // 在开发环境下提示缺少环境变量，避免运行时报错
  console.warn("Supabase env missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")

// 如果需要在不同会话创建实例，可使用此工厂函数
export const createSupabaseClient = () => createClient(supabaseUrl || "", supabaseAnonKey || "")
console.log("Supabase URL:", supabaseUrl)

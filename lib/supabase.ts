import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // 在开发环境下提示缺少环境变量，避免运行时报错
  console.warn("Supabase env missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// 确保即使环境变量缺失也能创建客户端（使用空字符串）
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key")

// 如果需要在不同会话创建实例，可使用此工厂函数
export const createSupabaseClient = () => createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key")

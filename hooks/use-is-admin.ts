import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

/**
 * Hook to check if the current user is an admin
 * @returns { isAdmin: boolean, loading: boolean }
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // 检查 Supabase 客户端是否有效
        if (!supabase) {
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // 获取当前登录用户的 session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        // 如果获取 session 出错或没有 session，不是管理员
        if (sessionError || !session?.user?.email) {
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // 获取环境变量中的管理员邮箱（客户端环境变量）
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

        // 如果环境变量未设置，不是管理员
        if (!adminEmail) {
          console.warn("NEXT_PUBLIC_ADMIN_EMAIL is not set in environment variables")
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // 判断当前用户邮箱是否等于管理员邮箱
        const isUserAdmin = session.user.email === adminEmail.trim()

        setIsAdmin(isUserAdmin)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()

    // 监听 auth 状态变化（仅在客户端）
    if (typeof window !== "undefined" && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        checkAdmin()
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  return { isAdmin, loading }
}


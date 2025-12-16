import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

// 简化版云端进度 Hook：只管理已完成的 lessonId（或 courseId）
export function useProgress() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初始化：从 Supabase 拉取当前用户的已完成 lesson_id
  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        // 未登录时直接结束，不报错
        if (!session?.user) {
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", session.user.id)
          .eq("is_completed", true)

        if (error) {
          console.error("Failed to load user_progress:", error)
        } else if (data) {
          setCompletedLessons(data.map((row) => row.lesson_id))
        }
      } catch (err) {
        console.error("Failed to load progress:", err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  // 乐观更新 + 后台 upsert
  const markAsCompleted = useCallback(async (lessonId: string) => {
    // 1. 本地乐观更新
    setCompletedLessons((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]))

    // 2. 后台同步到 Supabase
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        // 未登录，直接返回，不报错
        return
      }

      await supabase.from("user_progress").upsert({
        user_id: session.user.id,
        course_id: lessonId, // 这里暂用课程 ID 作为 course_id
        lesson_id: lessonId,
        is_completed: true,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Failed to save progress:", err)
      // 可以根据需要回滚本地状态，这里先保持乐观更新
    }
  }, [])

  const isCompleted = useCallback(
    (lessonId: string) => completedLessons.includes(lessonId),
    [completedLessons]
  )

  return {
    completedLessons,
    isLoading,
    markAsCompleted,
    isCompleted,
  }
}


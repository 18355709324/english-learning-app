"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LearningDashboard from "@/components/learning-dashboard"
import SentencePracticeApp from "@/components/sentence-practice-app"
import { supabase } from "@/lib/supabase"
import { useProgress } from "@/hooks/use-progress"

export default function Home() {
  const router = useRouter()
  const { markAsCompleted } = useProgress()
  const [showLesson, setShowLesson] = useState(false)
  const [currentCourseId, setCurrentCourseId] = useState<string>("daily-conversation")
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 简单的客户端路由保护：如果没有登录则跳转到 /login
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
      } else {
        setCheckingAuth(false)
      }
    }

    checkSession()
  }, [router])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        正在检查登录状态...
      </div>
    )
  }

  if (showLesson) {
    return (
      <SentencePracticeApp
        courseId={currentCourseId}
        onBack={() => setShowLesson(false)}
        onComplete={(stats) => {
          console.log("Course completed:", stats)
          // 标记课程完成（同步到本地 + Supabase）
          markAsCompleted(currentCourseId)
        }}
      />
    )
  }

  return (
    <LearningDashboard
      currentCourseId={currentCourseId}
      onStartLesson={(courseId) => {
        setCurrentCourseId(courseId)
        setShowLesson(true)
      }}
    />
  )
}

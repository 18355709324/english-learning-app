"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useProgress } from "@/hooks/use-progress"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export default function ProfilePage() {
  const router = useRouter()
  const { completedLessons } = useProgress()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setEmail(session.user.email ?? null)
      setLoading(false)
    }

    loadSession()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        载入中...
      </div>
    )
  }

  const displayName = email?.split("@")[0] || "User"
  const initials = displayName.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">个人资料</h1>
            <p className="text-slate-600 mt-1 text-sm">查看你的账户信息和学习概览</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            返回学习主页
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 p-6 flex flex-col items-center text-center rounded-2xl shadow-sm">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src="/abstract-profile.png" alt={displayName} />
              <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-600 mt-1">{email}</p>
          </Card>

          <Card className="md:col-span-2 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">学习进度</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>已完成课程</span>
                <span className="font-semibold text-slate-900">{completedLessons.length}</span>
              </div>
              <Progress
                value={completedLessons.length > 0 ? 100 : 0}
                className="h-2 rounded-full"
              />
              <p className="text-xs text-slate-500">
                未来可以在这里展示更细致的进度（每日时长、连续打卡天数等）。
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}



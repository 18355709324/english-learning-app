"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const router = useRouter()
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">设置</h1>
            <p className="text-slate-600 mt-1 text-sm">
              为账户 {email} 自定义你的学习体验
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            返回学习主页
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">学习偏好</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    自动播放语音
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    进入新题目时自动播放英文句子（仅在支持的浏览器上生效）。
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    启用键盘快捷键
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    使用 Enter 提交答案、上一题/跳过等快捷键，提升桌面端体验。
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">账户</h2>
            <p className="text-sm text-slate-600 mb-4">
              未来可以在这里修改邮箱、密码，或查看登录设备。
            </p>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              查看个人资料
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}



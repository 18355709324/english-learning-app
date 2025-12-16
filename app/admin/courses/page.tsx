"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { courses as defaultCourses } from "@/lib/courses"

type Course = {
  id: string
  title: string
  description: string | null
  icon_name: string | null
  total_lessons: number
  created_at: string
}

const ICON_OPTIONS = [
  "book-open",
  "shopping-bag",
  "utensils-crossed",
  "plane",
  "briefcase",
  "languages",
]

// 检查用户是否是管理员
async function checkIsAdmin(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user?.email) {
    return false
  }

  // 方式1: 通过环境变量配置的管理员邮箱列表
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim()) || []
  if (adminEmails.length > 0 && adminEmails.includes(session.user.email)) {
    return true
  }

  // 方式2: 通过 Supabase user_metadata 判断
  const userMetadata = session.user.user_metadata
  if (userMetadata?.is_admin === true || userMetadata?.role === "admin") {
    return true
  }

  return false
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [iconName, setIconName] = useState("book-open")
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // 检查管理员权限
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const admin = await checkIsAdmin()
      setIsAdmin(admin)

      if (!admin) {
        // 不是管理员，显示提示或跳转
        return
      }

      // 是管理员，加载课程数据
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Failed to load courses:", error)
        } else if (data) {
          setCourses(data as Course[])
        }
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  const refreshCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) {
      setCourses(data as Course[])
    }
  }

  const handleSaveCourse = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      let error
      if (editingCourse) {
        ;({ error } = await supabase
          .from("courses")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            icon_name: iconName || null,
          })
          .eq("id", editingCourse.id))
      } else {
        ;({ error } = await supabase.from("courses").insert({
          title: title.trim(),
          description: description.trim() || null,
          icon_name: iconName || null,
        }))
      }
      if (error) {
        console.error("Failed to create course:", error)
        alert("保存课程失败，请检查控制台日志。")
        return
      }
      setDialogOpen(false)
      setEditingCourse(null)
      setTitle("")
      setDescription("")
      setIconName("book-open")
      await refreshCourses()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("确定要删除这个课程吗？此操作不可恢复。")) return
    const { error } = await supabase.from("courses").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete course:", error)
      alert("删除失败，请检查控制台日志。")
      return
    }
    await refreshCourses()
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setTitle(course.title)
    setDescription(course.description || "")
    setIconName(course.icon_name || "book-open")
    setDialogOpen(true)
  }

  const handleOpenNewDialog = () => {
    setEditingCourse(null)
    setTitle("")
    setDescription("")
    setIconName("book-open")
    setDialogOpen(true)
  }

  // 一键导入现有前端课程配置（lib/courses.ts）到 Supabase
  const handleSeedFromDefaults = async () => {
    if (seeding) return
    if (!confirm("将当前前端内置的课程导入到数据库？（仅需执行一次）")) return
    setSeeding(true)
    try {
      const payload = defaultCourses.map((c) => ({
        title: c.title,
        description: c.description,
        icon_name: null, // 先留空，之后在管理页内编辑
        total_lessons: c.questionCount ?? 0,
      }))
      const { error } = await supabase.from("courses").insert(payload)
      if (error) {
        console.error("Failed to seed courses:", error)
        alert("导入失败，请检查控制台日志。")
        return
      }
      await refreshCourses()
    } finally {
      setSeeding(false)
    }
  }

  // 权限检查中
  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        正在检查权限...
      </div>
    )
  }

  // 不是管理员
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
        <p className="text-lg font-semibold">无权限访问</p>
        <p className="text-sm">您不是管理员，无法访问此页面。</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          返回首页
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">课程管理</h1>
            <p className="text-slate-600 mt-1 text-sm">
              管理首页展示的课程（仅 Admin 可编辑，RLS 已限制）
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-xl bg-teal-600 hover:bg-teal-700"
                onClick={handleOpenNewDialog}
              >
                新建课程
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "编辑课程" : "新建课程"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="如：购物场景"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="简要说明这个课程的内容"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">图标名称（Lucide 名称）</Label>
                  <Input
                    id="icon"
                    list="icon-options"
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    placeholder="如：shopping-bag"
                  />
                  <datalist id="icon-options">
                    {ICON_OPTIONS.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  <p className="text-xs text-slate-500">
                    将在前端通过 icon_name 匹配 Lucide 图标。
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className="rounded-xl bg-teal-600 hover:bg-teal-700"
                    onClick={handleSaveCourse}
                    disabled={saving || !title.trim()}
                  >
                    {saving ? "保存中..." : "保存课程"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          {loading ? (
            <div className="py-10 text-center text-slate-500 text-sm">加载中...</div>
          ) : courses.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              还没有任何课程，你可以点击“新建课程”手动添加，
              或者{" "}
              <button
                className="text-teal-600 hover:underline font-medium"
                onClick={handleSeedFromDefaults}
                disabled={seeding}
              >
                {seeding ? "正在导入..." : "一键导入默认课程"}
              </button>
              。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>图标</TableHead>
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow
                    key={course.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                  >
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="text-slate-600">
                      {course.description || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {course.icon_name || "—"}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-100 hover:bg-red-50 rounded-xl"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}



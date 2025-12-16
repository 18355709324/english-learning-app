"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateWordsFromEnglish } from "@/lib/course-manager"

type Course = {
  id: string
  title: string
  description: string | null
}

type Lesson = {
  id: string
  title: string
}

type Sentence = {
  id: string
  chinese: string
  english: string
  words: string[] | null
  lesson_id: string | null
}

type SentenceFormState = {
  id?: string
  chinese: string
  english: string
  wordsInput: string
}

type AiGeneratedItem = {
  cn: string
  en: string
  words: string[]
  selected?: boolean
}

export default function AdminCourseDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [sentences, setSentences] = useState<Sentence[]>([])

  const [loading, setLoading] = useState(true)
  const [sentencesLoading, setSentencesLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiItems, setAiItems] = useState<AiGeneratedItem[]>([])
  const [aiLevel, setAiLevel] = useState<"简单" | "中等" | "稍难">("中等")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null)
  const [form, setForm] = useState<SentenceFormState>({
    chinese: "",
    english: "",
    wordsInput: "",
  })

  const courseId = params.id

  const autoWords = useMemo(() => generateWordsFromEnglish(form.english), [form.english])

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const [{ data: courseData, error: courseError }, { data: lessonData, error: lessonError }] = await Promise.all([
        supabase.from("courses").select("id, title, description").eq("id", courseId).maybeSingle(),
        supabase.from("lessons").select("id, title").eq("course_id", courseId).order("order", { ascending: true }),
      ])

      if (!courseError && courseData) {
        setCourse(courseData as Course)
      }

      if (!lessonError && lessonData) {
        const lessonsTyped = lessonData as Lesson[]
        setLessons(lessonsTyped)
        if (lessonsTyped.length > 0) {
          setSelectedLessonId(lessonsTyped[0].id)
        }
      }

      setLoading(false)
    }

    if (courseId) {
      load()
    }
  }, [courseId])

  useEffect(() => {
    const loadSentences = async () => {
      if (!courseId) return
      setSentencesLoading(true)

      let query = supabase.from("sentences").select("id, chinese, english, words, lesson_id").eq("course_id", courseId)

      if (selectedLessonId) {
        query = query.eq("lesson_id", selectedLessonId)
      }

      const { data, error } = await query.order("id", { ascending: true })

      if (!error && data) {
        setSentences(data as Sentence[])
      }

      setSentencesLoading(false)
    }

    loadSentences()
  }, [courseId, selectedLessonId])

  const resetForm = () => {
    setEditingSentence(null)
    setForm({
      chinese: "",
      english: "",
      wordsInput: "",
    })
  }

  const openAddDialog = () => {
    setEditingSentence(null)
    setForm({
      chinese: "",
      english: "",
      wordsInput: "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (sentence: Sentence) => {
    setEditingSentence(sentence)
    const words = Array.isArray(sentence.words) ? sentence.words : []
    setForm({
      id: String(sentence.id),
      chinese: sentence.chinese,
      english: sentence.english,
      wordsInput: words.join(" "),
    })
    setDialogOpen(true)
  }

  const handleFormChange = (field: keyof SentenceFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "english" && (prev.wordsInput === "" || prev.wordsInput === autoWords.join(" "))
        ? { wordsInput: generateWordsFromEnglish(value).join(" ") }
        : {}),
    }))
  }

  const handleSaveSentence = async () => {
    if (!courseId) return
    if (!form.chinese.trim() || !form.english.trim()) {
      alert("中英文不能为空")
      return
    }

    const words =
      form.wordsInput.trim() !== ""
        ? form.wordsInput
            .split(/\s+/)
            .map((w) => w.trim())
            .filter(Boolean)
        : autoWords

    if (!words || words.length === 0) {
      alert("分词列表不能为空")
      return
    }

    setSaving(true)

    const payload: any = {
      course_id: courseId,
      chinese: form.chinese.trim(),
      english: form.english.trim(),
      words,
      lesson_id: selectedLessonId || null,
    }

    let error = null

    if (editingSentence) {
      const { error: updateError } = await supabase
        .from("sentences")
        .update(payload)
        .eq("id", editingSentence.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("sentences").insert(payload)
      error = insertError
    }

    setSaving(false)

    if (error) {
      console.error("保存句子失败", error)
      alert("保存失败，请稍后重试。")
      return
    }

    setDialogOpen(false)
    resetForm()

    let query = supabase.from("sentences").select("id, chinese, english, words, lesson_id").eq("course_id", courseId)
    if (selectedLessonId) {
      query = query.eq("lesson_id", selectedLessonId)
    }
    const { data } = await query.order("id", { ascending: true })
    if (data) {
      setSentences(data as Sentence[])
    }
  }

  const handleDeleteSentence = async (sentence: Sentence) => {
    if (!window.confirm("确定要删除这一条句子吗？")) return

    const { error } = await supabase.from("sentences").delete().eq("id", sentence.id)
    if (error) {
      console.error("删除句子失败", error)
      alert("删除失败，请稍后重试。")
      return
    }

    setSentences((prev) => prev.filter((s) => s.id !== sentence.id))
  }

  const handleToggleAiItem = (index: number) => {
    setAiItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)),
    )
  }

  const handleGenerateAiSentences = async () => {
    if (!course) return
    setAiLoading(true)
    setAiDialogOpen(true)
    setAiItems([])

    try {
      const res = await fetch("/api/generate-sentences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: course.title,
          count: 20,
          level:
            aiLevel === "简单"
              ? "难度较低，适合基础学习者"
              : aiLevel === "稍难"
              ? "难度稍高，适合有一定基础的学习者"
              : "中等难度，适合初中级学习者",
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "生成失败")
      }

      const json = await res.json()
      const items: AiGeneratedItem[] = Array.isArray(json.items)
        ? json.items.map((item: any) => ({
            cn: String(item.cn ?? "").trim(),
            en: String(item.en ?? "").trim(),
            words: Array.isArray(item.words)
              ? item.words.map((w: any) => String(w ?? "").trim()).filter(Boolean)
              : [],
            selected: true,
          }))
        : []

      setAiItems(items)
    } catch (error) {
      console.error("AI 生成失败", error)
      alert("AI 生成失败，请稍后重试。")
      setAiDialogOpen(false)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSaveSelectedAiItems = async () => {
    if (!courseId) return

    const selected = aiItems.filter((item) => item.selected && item.cn && item.en && item.words.length > 0)
    if (selected.length === 0) {
      alert("请至少保留一条要保存的句子。")
      return
    }

    try {
      // 先查出当前课程（以及选中 lesson）下已存在的英文句子，避免重复
      let query = supabase
        .from("sentences")
        .select("id, english")
        .eq("course_id", courseId)

      if (selectedLessonId) {
        query = query.eq("lesson_id", selectedLessonId)
      }

      const { data: existingData, error: existingError } = await query
      if (existingError) {
        console.error("查询现有句子失败", existingError)
      }

      const existingSet = new Set(
        (existingData || []).map((row: any) => String(row.english ?? "").trim().toLowerCase()),
      )

      const payload = selected
        .filter((item) => !existingSet.has(item.en.trim().toLowerCase()))
        .map((item) => ({
          course_id: courseId,
          lesson_id: selectedLessonId || null,
          chinese: item.cn,
          english: item.en,
          words: item.words,
        }))

      if (payload.length === 0) {
        alert("所有选中的句子在当前课程中已经存在，未插入新数据。")
        return
      }

      const { error } = await supabase.from("sentences").insert(payload as any[])
      if (error) {
        console.error("批量保存句子失败", error)
        alert(`保存失败：${error.message || "请稍后重试。"}`)
        return
      }

      // 重新加载句子列表
      let reloadQuery = supabase
        .from("sentences")
        .select("id, chinese, english, words, lesson_id")
        .eq("course_id", courseId)
      if (selectedLessonId) {
        reloadQuery = reloadQuery.eq("lesson_id", selectedLessonId)
      }
      const { data: reloaded } = await reloadQuery.order("id", { ascending: true })
      if (reloaded) {
        setSentences(reloaded as Sentence[])
      }

      setAiDialogOpen(false)
      setAiItems([])
    } catch (error) {
      console.error("保存 AI 生成句子时出错", error)
      alert("保存失败，请稍后重试。")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        载入中...
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 space-y-4">
        <p>未找到该课程。</p>
        <Button variant="outline" onClick={() => router.push("/admin/courses")}>
          返回课程列表
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-slate-600 mt-1 text-sm">
              管理该课程下的句子内容，支持手动添加、编辑和删除。若存在课时 (lesson)，可按课时筛选。
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin/courses")}>
            返回课程列表
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border bg-white/80 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">当前课时：</span>
            {lessons.length > 0 ? (
              <Select
                value={selectedLessonId ?? undefined}
                onValueChange={(value) => setSelectedLessonId(value)}
              >
                <SelectTrigger size="sm" className="min-w-[180px]">
                  <SelectValue placeholder="选择课时" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-xs text-slate-500">
                暂无 lesson 配置，当前将直接按课程维度管理句子。
              </span>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">AI 难度：</span>
              <Select
                value={aiLevel}
                onValueChange={(value) => setAiLevel(value as "简单" | "中等" | "稍难")}
              >
                <SelectTrigger size="sm" className="min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="简单">简单</SelectItem>
                  <SelectItem value="中等">中等</SelectItem>
                  <SelectItem value="稍难">稍难</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateAiSentences}
              disabled={aiLoading}
            >
              {aiLoading ? "AI 生成中..." : "✨ AI 一键生成 (20句)"}
            </Button>

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setDialogOpen(false)
                  resetForm()
                } else {
                  setDialogOpen(true)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" onClick={openAddDialog}>
                  ➕ 添加句子
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSentence ? "编辑句子" : "添加句子"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">中文 (Chinese)</label>
                    <Textarea
                      rows={2}
                      value={form.chinese}
                      onChange={(e) => handleFormChange("chinese", e.target.value)}
                      placeholder="请输入中文含义"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">英文 (English)</label>
                    <Textarea
                      rows={2}
                      value={form.english}
                      onChange={(e) => handleFormChange("english", e.target.value)}
                      placeholder="请输入英文原句"
                    />
                    <p className="text-xs text-slate-500">
                      会自动根据英文句子分词填充 words，可在下方手动调整。
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      分词 (words，使用空格分隔，支持手动修改)
                    </label>
                    <Input
                      value={form.wordsInput}
                      onChange={(e) => handleFormChange("wordsInput", e.target.value)}
                      placeholder={autoWords.join(" ")}
                    />
                    {autoWords.length > 0 && (
                      <p className="text-xs text-slate-400">自动分词预览：{autoWords.join(" ")}</p>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      取消
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleSaveSentence} disabled={saving}>
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-xl border bg-white/80 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-800">句子列表</h2>
            <span className="text-xs text-slate-500">共 {sentences.length} 条句子</span>
          </div>

          {sentencesLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">正在加载句子...</div>
          ) : sentences.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              还没有任何句子，点击右上角“添加句子”开始创建。
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-1/3">中文</TableHead>
                  <TableHead className="w-1/3">英文</TableHead>
                  <TableHead>words</TableHead>
                  <TableHead className="w-[140px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentences.map((sentence) => (
                  <TableRow key={sentence.id}>
                    <TableCell className="text-xs text-slate-500">{sentence.id}</TableCell>
                    <TableCell className="max-w-xs text-sm text-slate-800">
                      <div className="line-clamp-3">{sentence.chinese}</div>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-slate-800">
                      <div className="line-clamp-3">{sentence.english}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {Array.isArray(sentence.words) ? sentence.words.join(" ") : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(sentence)}>
                          编辑
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSentence(sentence)}>
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs text-slate-400">
                句子会用于该课程的练习题目，words 将直接作为单词拼句的词库来源。
              </TableCaption>
            </Table>
          )}
        </div>

        <Dialog
          open={aiDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setAiDialogOpen(false)
              setAiItems([])
            } else {
              setAiDialogOpen(true)
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>AI 生成句子预览</DialogTitle>
            </DialogHeader>

            {aiLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                AI 正在生成句子，请稍候...
              </div>
            ) : aiItems.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                暂无数据，请稍后重试。
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto rounded-lg border bg-slate-50/80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">保留</TableHead>
                      <TableHead className="w-1/3">中文</TableHead>
                      <TableHead className="w-1/3">英文</TableHead>
                      <TableHead>words</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiItems.map((item, index) => (
                      <TableRow key={`${item.en}-${index}`}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={item.selected ?? true}
                            onChange={() => handleToggleAiItem(index)}
                          />
                        </TableCell>
                        <TableCell className="max-w-xs text-sm">
                          <div className="line-clamp-3">{item.cn}</div>
                        </TableCell>
                        <TableCell className="max-w-xs text-sm">
                          <div className="line-clamp-3">{item.en}</div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {item.words.join(" ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  取消
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleSaveSelectedAiItems}
                disabled={aiLoading || aiItems.length === 0}
              >
                确认保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}




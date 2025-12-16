"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Save, X, BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Course, Question } from "@/lib/courses"
import {
  getCustomCourses,
  saveCustomCourse,
  deleteCustomCourse,
  generateCourseId,
  generateQuestionId,
  validateCourse,
  validateQuestion,
  generateWordsFromEnglish,
  calculateDuration,
} from "@/lib/course-manager"

const COURSE_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-teal-500 to-green-500",
  "from-indigo-500 to-blue-500",
  "from-yellow-500 to-orange-500",
  "from-gray-500 to-slate-500",
  "from-red-500 to-pink-500",
  "from-violet-500 to-purple-500",
  "from-rose-500 to-pink-500",
]

const COURSE_ICONS = ["💬", "🛍️", "🍽️", "✈️", "💼", "📚", "🚗", "🏥", "⏰", "😊", "🎯", "🌟", "🔥", "💡"]

export default function CourseManager() {
  const [customCourses, setCustomCourses] = useState<Course[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importText, setImportText] = useState("")

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = () => {
    setCustomCourses(getCustomCourses())
  }

  const handleCreateCourse = () => {
    const newCourse: Course = {
      id: generateCourseId(),
      title: "",
      description: "",
      icon: "📚",
      color: COURSE_COLORS[0],
      level: "beginner",
      duration: "5 min",
      questionCount: 0,
      questions: [],
      status: "in-progress",
      progress: 0,
    }
    setEditingCourse(newCourse)
    setIsCourseDialogOpen(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse({ ...course })
    setIsCourseDialogOpen(true)
  }

  const handleSaveCourse = () => {
    if (!editingCourse) return

    const validation = validateCourse(editingCourse)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // 更新题目数量和时长
    editingCourse.questionCount = editingCourse.questions.length
    editingCourse.duration = calculateDuration(editingCourse.questions.length)

    saveCustomCourse(editingCourse)
    loadCourses()
    setIsCourseDialogOpen(false)
    setEditingCourse(null)
  }

  const handleDeleteCourse = (courseId: string) => {
    deleteCustomCourse(courseId)
    loadCourses()
    setDeleteCourseId(null)
  }

  const normalizeCourse = (course: Partial<Course>): Course => {
    const questions: Question[] = (course.questions || []).map((q, idx) => {
      const words =
        q.words && q.words.length > 0
          ? q.words
          : q.english
            ? generateWordsFromEnglish(q.english)
            : []
      return {
        id: q.id ?? idx + 1,
        chinese: q.chinese || "",
        english: q.english || "",
        words,
      }
    })

    const questionCount = questions.length
    return {
      id: course.id || generateCourseId(),
      title: course.title || "未命名课程",
      description: course.description || "暂无描述",
      icon: course.icon || "📚",
      color: course.color || COURSE_COLORS[0],
      level: course.level || "beginner",
      duration: course.duration || calculateDuration(questionCount),
      questionCount,
      questions,
      status: course.status || "in-progress",
      progress: course.progress ?? 0,
      lastPracticed: course.lastPracticed,
    }
  }

  const handleImportJson = () => {
    if (!importText.trim()) {
      alert("请粘贴 JSON 内容")
      return
    }
    try {
      const parsed = JSON.parse(importText)
      const list: Partial<Course>[] = Array.isArray(parsed) ? parsed : parsed.courses
      if (!Array.isArray(list) || list.length === 0) {
        alert("JSON 格式应为课程数组或 { courses: [...] }，且不能为空")
        return
      }

      list.forEach((item) => {
        const normalized = normalizeCourse(item)
        const validation = validateCourse(normalized)
        if (!validation.valid) {
          throw new Error(validation.error)
        }
        saveCustomCourse(normalized)
      })

      loadCourses()
      setIsImportDialogOpen(false)
      setImportText("")
      alert("导入成功")
    } catch (err: any) {
      alert(`导入失败：${err.message || err}`)
    }
  }

  const handleAddQuestion = () => {
    if (!editingCourse) return

    const newQuestion: Question = {
      id: generateQuestionId(editingCourse),
      chinese: "",
      english: "",
      words: [],
    }
    setEditingQuestion(newQuestion)
    setIsQuestionDialogOpen(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question })
    setIsQuestionDialogOpen(true)
  }

  const handleSaveQuestion = () => {
    if (!editingQuestion || !editingCourse) return

    const validation = validateQuestion(editingQuestion)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // 如果单词列表为空，自动生成
    if (editingQuestion.words.length === 0 && editingQuestion.english) {
      editingQuestion.words = generateWordsFromEnglish(editingQuestion.english)
    }

    const updatedQuestions = [...editingCourse.questions]
    const existingIndex = updatedQuestions.findIndex((q) => q.id === editingQuestion.id)

    if (existingIndex >= 0) {
      updatedQuestions[existingIndex] = editingQuestion
    } else {
      updatedQuestions.push(editingQuestion)
    }

    setEditingCourse({ ...editingCourse, questions: updatedQuestions })
    setIsQuestionDialogOpen(false)
    setEditingQuestion(null)
  }

  const handleDeleteQuestion = (questionId: number) => {
    if (!editingCourse) return

    const updatedQuestions = editingCourse.questions.filter((q) => q.id !== questionId)
    setEditingCourse({ ...editingCourse, questions: updatedQuestions })
  }

  const handleEnglishChange = (english: string) => {
    if (!editingQuestion) return

    setEditingQuestion({
      ...editingQuestion,
      english,
      // 自动生成单词列表
      words: generateWordsFromEnglish(english),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-teal-600" />
              词库管理
            </h1>
            <p className="text-gray-600 mt-2">创建和管理你的自定义课程和题目</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
              批量导入 (JSON)
            </Button>
            <Button onClick={handleCreateCourse} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-5 w-5 mr-2" />
              新建课程
            </Button>
          </div>
        </div>

        {customCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有自定义课程</h3>
            <p className="text-gray-600 mb-6">创建你的第一个课程，开始个性化学习</p>
            <Button onClick={handleCreateCourse} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-5 w-5 mr-2" />
              创建课程
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
              >
                <div className={`h-32 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center text-5xl mb-4`}>
                  {course.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{course.questionCount} 道题</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    course.level === "beginner" ? "bg-green-100 text-green-700" :
                    course.level === "intermediate" ? "bg-blue-100 text-blue-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {course.level === "beginner" ? "初级" : course.level === "intermediate" ? "中级" : "高级"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditCourse(course)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    编辑
                  </Button>
                  <Button
                    onClick={() => setDeleteCourseId(course.id)}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 课程编辑对话框 */}
        <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse?.id.startsWith("custom-") ? "新建课程" : "编辑课程"}</DialogTitle>
              <DialogDescription>填写课程信息，然后添加题目</DialogDescription>
            </DialogHeader>

            {editingCourse && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>课程标题 *</Label>
                    <Input
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      placeholder="例如：商务英语"
                    />
                  </div>
                  <div>
                    <Label>图标</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COURSE_ICONS.slice(0, 8).map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setEditingCourse({ ...editingCourse, icon })}
                          className={`w-10 h-10 text-2xl rounded-lg border-2 transition-all ${
                            editingCourse.icon === icon
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>课程描述 *</Label>
                  <Textarea
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    placeholder="描述这个课程的内容和目标"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>难度等级</Label>
                    <Select
                      value={editingCourse.level}
                      onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                        setEditingCourse({ ...editingCourse, level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">初级</SelectItem>
                        <SelectItem value="intermediate">中级</SelectItem>
                        <SelectItem value="advanced">高级</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>主题颜色</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {COURSE_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditingCourse({ ...editingCourse, color })}
                          className={`h-10 rounded-lg bg-gradient-to-br ${color} border-2 transition-all ${
                            editingCourse.color === color ? "border-gray-900 scale-110" : "border-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>题目列表 ({editingCourse.questions.length})</Label>
                    <Button onClick={handleAddQuestion} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      添加题目
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {editingCourse.questions.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">还没有题目，点击"添加题目"开始</p>
                    ) : (
                      editingCourse.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{question.chinese}</div>
                            <div className="text-sm text-gray-600">{question.english}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditQuestion(question)}
                              size="sm"
                              variant="ghost"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteQuestion(question.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleSaveCourse} className="flex-1 bg-teal-600 hover:bg-teal-700">
                    <Save className="h-4 w-4 mr-2" />
                    保存课程
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCourseDialogOpen(false)
                      setEditingCourse(null)
                    }}
                    variant="outline"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 批量导入对话框 */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>批量导入（JSON）</DialogTitle>
              <DialogDescription>
                粘贴 JSON，支持数组或 {"{"} "courses": [...] {"}"}，每个课程需包含 title、description、questions（中文、英文、words 可留空自动生成）
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Label>示例格式</Label>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">
{`{
  "courses": [
    {
      "title": "旅行场景",
      "description": "出行常用表达",
      "icon": "✈️",
      "color": "from-teal-500 to-green-500",
      "level": "beginner",
      "questions": [
        { "chinese": "到机场要多久？", "english": "How long does it take to get to the airport?" }
      ]
    }
  ]
}`}
              </pre>

              <div>
                <Label>粘贴 JSON</Label>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={10}
                  placeholder="在此粘贴 JSON 内容"
                  className="font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleImportJson} className="bg-teal-600 hover:bg-teal-700 flex-1">
                  导入
                </Button>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 题目编辑对话框 */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingQuestion?.id ? "编辑题目" : "新建题目"}</DialogTitle>
              <DialogDescription>填写题目的中文和英文，单词列表会自动生成</DialogDescription>
            </DialogHeader>

            {editingQuestion && (
              <div className="space-y-4">
                <div>
                  <Label>中文句子 *</Label>
                  <Input
                    value={editingQuestion.chinese}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, chinese: e.target.value })}
                    placeholder="例如：你好，很高兴见到你。"
                  />
                </div>

                <div>
                  <Label>英文句子 *</Label>
                  <Input
                    value={editingQuestion.english}
                    onChange={(e) => handleEnglishChange(e.target.value)}
                    placeholder="例如：Hello, nice to meet you."
                  />
                  <p className="text-xs text-gray-500 mt-1">输入英文后，单词列表会自动生成</p>
                </div>

                <div>
                  <Label>单词列表（可编辑）</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-16">
                    {editingQuestion.words.length === 0 ? (
                      <p className="text-sm text-gray-400">输入英文句子后会自动生成单词列表</p>
                    ) : (
                      editingQuestion.words.map((word, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium"
                        >
                          {word}
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    提示：单词列表会根据英文句子自动生成，通常不需要手动修改
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleSaveQuestion} className="flex-1 bg-teal-600 hover:bg-teal-700">
                    <Save className="h-4 w-4 mr-2" />
                    保存题目
                  </Button>
                  <Button
                    onClick={() => {
                      setIsQuestionDialogOpen(false)
                      setEditingQuestion(null)
                    }}
                    variant="outline"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <AlertDialog open={!!deleteCourseId} onOpenChange={(open) => !open && setDeleteCourseId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除这个课程吗？此操作无法撤销，课程中的所有题目也会被删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteCourseId && handleDeleteCourse(deleteCourseId)}
                className="bg-red-600 hover:bg-red-700"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}


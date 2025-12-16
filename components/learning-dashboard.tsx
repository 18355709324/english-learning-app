"use client"

import { useState, useEffect } from "react"
import {
  Home,
  BookOpen,
  ShoppingBag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  Trophy,
  TrendingUp,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserNav } from "@/components/UserNav"
import { courses, getAllCourses, type Course } from "@/lib/courses"
import CourseManager from "@/components/course-manager"
import { 
  getCourseProgress, 
  getCurrentStreak, 
  getTotalLearningTime, 
  getTotalQuestionsAnswered,
  getTotalCorrectAnswers,
  getOverallAccuracy,
  getWeeklyStats,
  updateCourseProgress
} from "@/lib/learning-progress"
import { useProgress } from "@/hooks/use-progress"
import { supabase } from "@/lib/supabase"

export default function LearningDashboard({ 
  onStartLesson,
  currentCourseId 
}: { 
  onStartLesson: (courseId: string) => void
  currentCourseId?: string
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState("home")
  const [streak, setStreak] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [overallAccuracy, setOverallAccuracy] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState(getWeeklyStats())
  const { isCompleted } = useProgress()
  const [courseQuestionCounts, setCourseQuestionCounts] = useState<Record<string, number>>({})
  const [supabaseCourses, setSupabaseCourses] = useState<Record<string, { title: string; description: string | null; icon_name: string | null }>>({})

  // 加载学习统计数据
  useEffect(() => {
    const loadStats = () => {
      setStreak(getCurrentStreak())
      setTotalTime(getTotalLearningTime())
      setTotalQuestions(getTotalQuestionsAnswered())
      setTotalCorrect(getTotalCorrectAnswers())
      setOverallAccuracy(getOverallAccuracy())
      setWeeklyStats(getWeeklyStats())
    }
    loadStats()
    // 监听存储变化（当从练习页面返回时刷新数据）
    const interval = setInterval(loadStats, 1000)
    return () => clearInterval(interval)
  }, [])

  // 从 Supabase 加载课程信息和题目数量
  useEffect(() => {
    const loadCourseData = async () => {
      const allCourses = getAllCourses()
      const counts: Record<string, number> = {}
      const coursesMap: Record<string, { title: string; description: string | null; icon_name: string | null }> = {}

      for (const course of allCourses) {
        try {
          // 查找对应的 Supabase 课程
          const { data: courseRow } = await supabase
            .from("courses")
            .select("id, title, description, icon_name")
            .eq("app_course_id", course.id)
            .maybeSingle()

          if (courseRow) {
            // 保存 Supabase 中的课程信息（标题、描述、图标）
            coursesMap[course.id] = {
              title: courseRow.title,
              description: courseRow.description,
              icon_name: courseRow.icon_name,
            }

            // 统计该课程下的句子数量
            const { count } = await supabase
              .from("sentences")
              .select("*", { count: "exact", head: true })
              .eq("course_id", courseRow.id)

            if (count !== null && count > 0) {
              counts[course.id] = count
            } else {
              // 如果没有云端数据，使用本地题目数量
              counts[course.id] = course.questionCount
            }
          } else {
            // 如果没有对应的 Supabase 课程，使用本地题目数量
            counts[course.id] = course.questionCount
          }
        } catch (error) {
          console.error(`加载课程 ${course.id} 数据失败:`, error)
          // 出错时使用本地数据
          counts[course.id] = course.questionCount
        }
      }

      setCourseQuestionCounts(counts)
      setSupabaseCourses(coursesMap)
    }

    loadCourseData()
  }, [])

  const navItems = [
    { id: "home", icon: Home, label: "首页" },
    { id: "courses", icon: BookOpen, label: "我的课程" },
    { id: "marketplace", icon: ShoppingBag, label: "课程市场" },
    { id: "stats", icon: BarChart3, label: "统计" },
    { id: "manager", icon: Settings, label: "词库管理" },
  ]

  const renderContent = () => {
    switch (activeNav) {
      case "home":
        return renderHomeContent()
      case "courses":
        return renderCoursesContent()
      case "marketplace":
        return renderMarketplaceContent()
      case "stats":
        return renderStatsContent()
      case "manager":
        return renderManagerContent()
      default:
        return renderHomeContent()
    }
  }

  const renderManagerContent = () => {
    return <CourseManager />
  }

  // 获取当前正在学习的课程（根据实际进度或传入的课程ID）
  const getCurrentCourse = () => {
    // 获取所有课程（包括自定义课程）
    const allCourses = getAllCourses()
    
    // 找到有进度的课程
    const coursesWithProgress = allCourses.map(course => {
      const progress = getCourseProgress(course.id)
      // 优先使用 Supabase 中的课程信息
      const supabaseCourse = supabaseCourses[course.id]
      return {
        ...course,
        title: supabaseCourse?.title || course.title,
        description: supabaseCourse?.description || course.description,
        progress: progress ? progress.progress : course.progress,
        lastPracticed: progress?.lastPracticed || course.lastPracticed,
      }
    })
    
    // 如果传入了 currentCourseId，优先返回这个课程
    if (currentCourseId) {
      const targetCourse = coursesWithProgress.find(c => c.id === currentCourseId)
      if (targetCourse) return targetCourse
    }
    
    // 否则，优先返回有进度的课程
    const inProgress = coursesWithProgress.find(c => c.progress > 0 && c.progress < 100)
    return inProgress || coursesWithProgress[0]
  }
  
  const currentCourse = getCurrentCourse()

  const renderHomeContent = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Course Overview Card */}
      <div className={`bg-gradient-to-br ${currentCourse.color} rounded-2xl shadow-sm p-8 text-white`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <p className="text-white/90 text-sm font-medium mb-2">正在学习</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{currentCourse.icon}</span>
              <h2 className="text-3xl font-bold">{currentCourse.title}</h2>
            </div>
            <p className="text-white/80 text-sm mb-4">{currentCourse.description}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">课程进度</span>
                  <span className="font-semibold">{Math.round(currentCourse.progress)}% 完成</span>
              </div>
              <Progress value={currentCourse.progress} className="h-2 bg-white/20" />
            </div>
          </div>
          <Button
            onClick={() => onStartLesson(currentCourse.id)}
            size="lg"
            className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Play className="h-5 w-5 mr-2 fill-current" />
            继续学习
          </Button>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">所有课程</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>共 {getAllCourses().length} 门课程</span>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getAllCourses().map((course) => {
            const progress = getCourseProgress(course.id)
            // 获取实际题目数量（优先使用 Supabase 的数量）
            const actualQuestionCount = courseQuestionCounts[course.id] ?? course.questionCount
            // 如果进度数据存在且总题目数已更新，使用进度数据；否则使用课程默认进度
            let courseProgress = course.progress
            if (progress) {
              // 如果进度数据中的总题目数和实际题目数不一致，重新计算进度
              if (progress.totalQuestions !== actualQuestionCount && actualQuestionCount > 0) {
                // 重新计算进度：已完成题目数 / 实际总题目数
                courseProgress = (progress.completedQuestions.length / actualQuestionCount) * 100
                // 更新进度数据（异步，不阻塞渲染）
                if (progress.totalQuestions !== actualQuestionCount) {
                  updateCourseProgress(course.id, actualQuestionCount)
                }
              } else {
                courseProgress = progress.progress
              }
            }
            // 云端进度优先：如果在 Supabase 中标记为已完成，则视为已完成
            const completedInCloud = isCompleted(course.id)
            const isCourseCompleted = completedInCloud || courseProgress >= 100
            
            return (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md cursor-pointer hover:border-teal-300"
              onClick={() => {
                onStartLesson(course.id)
              }}
            >
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl`}>
                  {course.icon}
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isCourseCompleted
                      ? "bg-green-100 text-green-700"
                      : courseProgress > 0
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {!isCourseCompleted && courseProgress > 0 && "进行中"}
                  {!isCourseCompleted && courseProgress === 0 && "未开始"}
                  {isCourseCompleted && "已完成"}
                </span>
              </div>

              {/* Course Info */}
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>

              {/* Progress */}
              {courseProgress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>进度</span>
                    <span>{Math.round(courseProgress)}%</span>
                  </div>
                  <Progress value={courseProgress} className="h-1.5" />
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{courseQuestionCounts[course.id] ?? course.questionCount} 题</span>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">连续学习</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">{streak} 天</p>
          <p className="text-sm text-gray-600 mt-1">继续保持！</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-teal-600" />
            </div>
            <h4 className="font-semibold text-gray-900">总答题数</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
          <p className="text-sm text-gray-600 mt-1">准确率 {Math.round(overallAccuracy)}%</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">总学习时间</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor(totalTime / 3600) > 0 ? `${Math.floor(totalTime / 3600)} 小时 ` : ""}
            {Math.floor((totalTime % 3600) / 60)} 分钟
          </p>
          <p className="text-sm text-gray-600 mt-1">本周</p>
        </div>
      </div>
    </div>
  )

  const renderCoursesContent = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">我的课程</h2>
        <Button className="bg-teal-600 hover:bg-teal-700 rounded-xl">浏览所有课程</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">商务英语</h3>
              <p className="text-sm text-gray-600">24 课时 • 中级</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">进度</span>
              <span className="font-semibold text-gray-900">40%</span>
            </div>
            <Progress value={40} className="h-2" />
          </div>
          <Button onClick={() => onStartLesson("daily-conversation")} className="w-full bg-teal-600 hover:bg-teal-700 rounded-xl">
            继续学习
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">旅行英语</h3>
              <p className="text-sm text-gray-600">18 课时 • 初级</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">进度</span>
              <span className="font-semibold text-gray-900">15%</span>
            </div>
            <Progress value={15} className="h-2" />
          </div>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl">继续学习</Button>
        </div>
      </div>
    </div>
  )

  const renderMarketplaceContent = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">课程市场</h2>
          <p className="text-gray-600 mt-1">发现新课程，扩展你的英语技能</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "高级语法",
            lessons: 32,
            level: "高级",
            price: "¥199",
            color: "from-orange-500 to-red-600",
          },
          {
            title: "雅思备考",
            lessons: 45,
            level: "高级",
            price: "¥299",
            color: "from-blue-500 to-indigo-600",
          },
          {
            title: "日常对话",
            lessons: 20,
            level: "初级",
            price: "¥99",
            color: "from-green-500 to-teal-600",
          },
        ].map((course, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`h-32 bg-gradient-to-br ${course.color}`} />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {course.lessons} 课时 • {course.level}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{course.price}</span>
                <Button className="bg-teal-600 hover:bg-teal-700 rounded-xl">报名</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStatsContent = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">你的统计</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-1">连续学习</p>
          <p className="text-3xl font-bold text-gray-900">{streak} 天</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-teal-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">已完成课时</p>
          <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-1">总学习时间</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor(totalTime / 3600) > 0 ? `${Math.floor(totalTime / 3600)} 小时 ` : ""}
            {Math.floor((totalTime % 3600) / 60)} 分钟
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">准确率</p>
          <p className="text-3xl font-bold text-gray-900">{Math.round(overallAccuracy)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">每周活动</h3>
        <div className="h-64 flex items-end justify-between gap-4">
          {[40, 65, 80, 55, 90, 75, 60].map((height, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-teal-100 rounded-t-lg transition-all hover:bg-teal-200"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-gray-600">{["周一", "周二", "周三", "周四", "周五", "周六", "周日"][idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚✨</span>
              <h1 className="text-xl font-bold text-teal-600">LingoBlocks</h1>
            </div>
          )}
          {sidebarCollapsed && <span className="text-2xl">📚</span>}
          <Button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            size="icon"
            variant="ghost"
            className="rounded-lg hover:bg-gray-100"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? "bg-teal-50 text-teal-600 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed && (
            <div className="bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-1">升级到专业版</h3>
              <p className="text-sm text-white/90 mb-3">解锁所有课程和功能</p>
              <Button size="sm" className="w-full bg-white text-teal-600 hover:bg-gray-100">
                立即升级
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {navItems.find(item => item.id === activeNav)?.label || activeNav}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Button>
            <UserNav />
          </div>
        </header>

        {/* Content Area - Now renders different content based on active navigation */}
        <main className="flex-1 overflow-y-auto p-8">{renderContent()}</main>
      </div>
    </div>
  )
}

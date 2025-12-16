// 学习进度管理工具

import type { Course } from "./courses"

export interface LearningStats {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  timeSpent: number // 秒
  date: string
}

export interface UserProgress {
  courseId: string
  completedQuestions: number[]
  totalQuestions: number
  progress: number
  lastPracticed?: string
  stats: LearningStats[]
}

export interface DailyStats {
  date: string
  coursesCompleted: number
  questionsAnswered: number
  correctAnswers: number
  timeSpent: number
  streak: number // 连续学习天数
}

const STORAGE_KEY = "english-learning-progress"
const DAILY_STATS_KEY = "english-learning-daily-stats"
const STREAK_KEY = "english-learning-streak"

// 获取所有学习进度
export function getAllProgress(): Record<string, UserProgress> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

// 获取特定课程的进度
export function getCourseProgress(courseId: string): UserProgress | null {
  const allProgress = getAllProgress()
  return allProgress[courseId] || null
}

// 保存课程进度
export function saveCourseProgress(
  courseId: string,
  questionId: number,
  isCorrect: boolean,
  timeSpent: number
) {
  const allProgress = getAllProgress()
  let progress = allProgress[courseId]

  if (!progress) {
    progress = {
      courseId,
      completedQuestions: [],
      totalQuestions: 0,
      progress: 0,
      stats: [],
    }
  }

  // 添加已完成的题目ID（如果还没完成）
  if (!progress.completedQuestions.includes(questionId)) {
    progress.completedQuestions.push(questionId)
  }

  // 更新统计
  const today = new Date().toISOString().split("T")[0]
  let todayStats = progress.stats.find((s) => s.date === today)

  if (!todayStats) {
    todayStats = {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      timeSpent: 0,
      date: today,
    }
    progress.stats.push(todayStats)
  }

  todayStats.totalQuestions++
  if (isCorrect) {
    todayStats.correctAnswers++
  }
  todayStats.accuracy = (todayStats.correctAnswers / todayStats.totalQuestions) * 100
  todayStats.timeSpent += timeSpent

  // 更新最后练习时间
  progress.lastPracticed = today

  // 如果 totalQuestions 已设置，自动更新进度百分比
  if (progress.totalQuestions > 0) {
    progress.progress = (progress.completedQuestions.length / progress.totalQuestions) * 100
  }

  // 保存
  allProgress[courseId] = progress
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress))

  // 更新每日统计
  updateDailyStats(isCorrect, timeSpent)
}

// 更新课程总进度
export function updateCourseProgress(courseId: string, totalQuestions: number) {
  const allProgress = getAllProgress()
  let progress = allProgress[courseId]

  if (!progress) {
    progress = {
      courseId,
      completedQuestions: [],
      totalQuestions,
      progress: 0,
      stats: [],
    }
  }

  progress.totalQuestions = totalQuestions
  progress.progress = totalQuestions > 0 ? (progress.completedQuestions.length / totalQuestions) * 100 : 0

  const allProgressUpdated = { ...allProgress, [courseId]: progress }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgressUpdated))
}

// 更新每日统计
function updateDailyStats(isCorrect: boolean, timeSpent: number) {
  const today = new Date().toISOString().split("T")[0]
  const data = localStorage.getItem(DAILY_STATS_KEY)
  const dailyStats: Record<string, DailyStats> = data ? JSON.parse(data) : {}

  if (!dailyStats[today]) {
    dailyStats[today] = {
      date: today,
      coursesCompleted: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
      streak: getCurrentStreak(),
    }
  }

  dailyStats[today].questionsAnswered++
  if (isCorrect) {
    dailyStats[today].correctAnswers++
  }
  dailyStats[today].timeSpent += timeSpent

  localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(dailyStats))

  // 更新连续学习天数
  updateStreak()
}

// 获取连续学习天数
export function getCurrentStreak(): number {
  if (typeof window === "undefined") return 0
  const streak = localStorage.getItem(STREAK_KEY)
  return streak ? parseInt(streak, 10) : 0
}

// 更新连续学习天数
function updateStreak() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayStr = today.toISOString().split("T")[0]
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  const data = localStorage.getItem(DAILY_STATS_KEY)
  const dailyStats: Record<string, DailyStats> = data ? JSON.parse(data) : {}

  const currentStreak = getCurrentStreak()

  // 如果今天有学习记录
  if (dailyStats[todayStr]) {
    // 如果昨天也有学习记录，连续天数+1
    if (dailyStats[yesterdayStr]) {
      localStorage.setItem(STREAK_KEY, (currentStreak + 1).toString())
    } else if (currentStreak === 0) {
      // 如果之前没有连续记录，今天开始新的连续
      localStorage.setItem(STREAK_KEY, "1")
    }
  }
}

// 获取每日统计
export function getDailyStats(date?: string): DailyStats | null {
  if (typeof window === "undefined") return null
  const targetDate = date || new Date().toISOString().split("T")[0]
  const data = localStorage.getItem(DAILY_STATS_KEY)
  const dailyStats: Record<string, DailyStats> = data ? JSON.parse(data) : {}
  return dailyStats[targetDate] || null
}

// 获取总学习时间（秒）
export function getTotalLearningTime(): number {
  if (typeof window === "undefined") return 0
  const data = localStorage.getItem(DAILY_STATS_KEY)
  const dailyStats: Record<string, DailyStats> = data ? JSON.parse(data) : {}
  return Object.values(dailyStats).reduce((total, stat) => total + stat.timeSpent, 0)
}

// 获取总答题数
export function getTotalQuestionsAnswered(): number {
  if (typeof window === "undefined") return 0
  const data = localStorage.getItem(DAILY_STATS_KEY)
  const dailyStats: Record<string, DailyStats> = data ? JSON.parse(data) : {}
  return Object.values(dailyStats).reduce((total, stat) => total + stat.questionsAnswered, 0)
}

// 获取总正确数
export function getTotalCorrectAnswers(): number {
  if (typeof window === "undefined") return 0
  const data = localStorage.getItem(DAILY_STATS_KEY)
  const dailyStats: Record<string, DailyStats> = data ? JSON.parse(data) : {}
  return Object.values(dailyStats).reduce((total, stat) => total + stat.correctAnswers, 0)
}

// 获取总准确率
export function getOverallAccuracy(): number {
  const total = getTotalQuestionsAnswered()
  const correct = getTotalCorrectAnswers()
  return total > 0 ? (correct / total) * 100 : 0
}

// 获取本周学习数据
export function getWeeklyStats(): DailyStats[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(DAILY_STATS_KEY)
  const dailyStats: Record<string, DailyStats> = data ? JSON.parse(data) : {}

  const week: DailyStats[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    week.push(
      dailyStats[dateStr] || {
        date: dateStr,
        coursesCompleted: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        timeSpent: 0,
        streak: 0,
      }
    )
  }

  return week
}


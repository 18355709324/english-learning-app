// 词库管理工具 - 用于保存和管理用户自定义的课程和题目

import type { Course, Question } from "./courses"

const CUSTOM_COURSES_KEY = "english-learning-custom-courses"

// 获取所有自定义课程
export function getCustomCourses(): Course[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(CUSTOM_COURSES_KEY)
  return data ? JSON.parse(data) : []
}

// 保存自定义课程
export function saveCustomCourse(course: Course) {
  const customCourses = getCustomCourses()
  const existingIndex = customCourses.findIndex((c) => c.id === course.id)
  
  if (existingIndex >= 0) {
    // 更新现有课程
    customCourses[existingIndex] = course
  } else {
    // 添加新课程
    customCourses.push(course)
  }
  
  localStorage.setItem(CUSTOM_COURSES_KEY, JSON.stringify(customCourses))
}

// 删除自定义课程
export function deleteCustomCourse(courseId: string) {
  const customCourses = getCustomCourses()
  const filtered = customCourses.filter((c) => c.id !== courseId)
  localStorage.setItem(CUSTOM_COURSES_KEY, JSON.stringify(filtered))
}

// 获取单个自定义课程
export function getCustomCourseById(courseId: string): Course | undefined {
  const customCourses = getCustomCourses()
  return customCourses.find((c) => c.id === courseId)
}

// 生成新的课程ID
export function generateCourseId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 生成新的题目ID
export function generateQuestionId(course: Course): number {
  if (course.questions.length === 0) return 1
  return Math.max(...course.questions.map((q) => q.id)) + 1
}

// 验证课程数据
export function validateCourse(course: Partial<Course>): { valid: boolean; error?: string } {
  if (!course.title || course.title.trim() === "") {
    return { valid: false, error: "课程标题不能为空" }
  }
  if (!course.description || course.description.trim() === "") {
    return { valid: false, error: "课程描述不能为空" }
  }
  if (!course.questions || course.questions.length === 0) {
    return { valid: false, error: "课程至少需要一道题目" }
  }
  return { valid: true }
}

// 验证题目数据
export function validateQuestion(question: Partial<Question>): { valid: boolean; error?: string } {
  if (!question.chinese || question.chinese.trim() === "") {
    return { valid: false, error: "中文句子不能为空" }
  }
  if (!question.english || question.english.trim() === "") {
    return { valid: false, error: "英文句子不能为空" }
  }
  if (!question.words || question.words.length === 0) {
    return { valid: false, error: "单词列表不能为空" }
  }
  return { valid: true }
}

// 从英文句子自动生成单词列表
export function generateWordsFromEnglish(english: string): string[] {
  if (!english || english.trim() === "") return []
  
  const words: string[] = []
  // 使用正则表达式匹配单词和标点符号
  // \w+ 匹配单词，[.,!?;:] 匹配标点符号
  const tokens = english.match(/\w+|[.,!?;:]/g) || []
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    
    if (/[.,!?;:]/.test(token)) {
      // 标点符号直接添加
      words.push(token)
    } else {
      // 单词：首字母大写，其余小写
      const capitalized = token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()
      words.push(capitalized)
    }
  }
  
  return words
}

// 计算课程预计时长（基于题目数量）
export function calculateDuration(questionCount: number): string {
  // 假设每道题平均需要30秒
  const minutes = Math.ceil((questionCount * 30) / 60)
  return `${minutes} min`
}


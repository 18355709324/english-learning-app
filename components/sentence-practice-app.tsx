"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, CheckCircle2, XCircle, X, Heart, Lightbulb, Volume1, Timer, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { getCourseById, type Question } from "@/lib/courses"
import { saveCourseProgress, updateCourseProgress } from "@/lib/learning-progress"
import { supabase } from "@/lib/supabase"
import { generateWordsFromEnglish } from "@/lib/course-manager"

interface SentencePracticeAppProps {
  courseId?: string
  onBack?: () => void
  onComplete?: (stats: { correct: number; total: number; accuracy: number }) => void
}

export default function SentencePracticeApp({ 
  courseId = "daily-conversation", 
  onBack,
  onComplete 
}: SentencePracticeAppProps) {
  const router = useRouter()
  const course = getCourseById(courseId)

  const [remoteQuestions, setRemoteQuestions] = useState<Question[] | null>(null)
  const [loadingRemote, setLoadingRemote] = useState(false)
  const [remoteError, setRemoteError] = useState<string | null>(null)

  const questions: Question[] = useMemo(() => {
    if (remoteQuestions && remoteQuestions.length > 0) {
      return remoteQuestions
    }
    return course?.questions || []
  }, [remoteQuestions, course])
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isChecked, setIsChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showShake, setShowShake] = useState(false)
  const [inputMode, setInputMode] = useState<"drag" | "type">("drag")
  const [keyboardInput, setKeyboardInput] = useState("")
  const [lives, setLives] = useState(3)
  const [showHint, setShowHint] = useState(false)
  const [showAudioRipple, setShowAudioRipple] = useState(false)
  const [showSlowAudioRipple, setShowSlowAudioRipple] = useState(false)
  const [draggedWord, setDraggedWord] = useState<{ word: string; fromBank: boolean; index: number } | null>(null)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayingSlow, setIsPlayingSlow] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const totalQuestions = questions.length
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  // 从 Supabase 动态加载当前课程的句子（如果 courses 表配置了 app_course_id）
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!courseId) return
      try {
        setLoadingRemote(true)
        setRemoteError(null)

        // 1. 找到与当前 courseId 绑定的 Supabase 课程（app_course_id 字段）
        const { data: courseRow, error: courseError } = await supabase
          .from("courses")
          .select("id")
          .eq("app_course_id", courseId)
          .maybeSingle()

        if (courseError || !courseRow) {
          setLoadingRemote(false)
          return
        }

        // 2. 加载该课程下的 sentences
        const { data: sentenceRows, error: sentenceError } = await supabase
          .from("sentences")
          .select("chinese, english, words")
          .eq("course_id", courseRow.id)
          .order("created_at", { ascending: true })

        if (sentenceError || !sentenceRows || sentenceRows.length === 0) {
          setLoadingRemote(false)
          return
        }

        const mapped: Question[] = sentenceRows.map((row: any, index: number) => {
          const english: string = String(row.english ?? "").trim()
          const chinese: string = String(row.chinese ?? "").trim()
          const wordsFromDb: string[] = Array.isArray(row.words)
            ? row.words.map((w: any) => String(w ?? "").trim()).filter(Boolean)
            : []

          const words = wordsFromDb.length > 0 ? wordsFromDb : generateWordsFromEnglish(english)

          return {
            id: index + 1,
            chinese,
            english,
            words,
          }
        })

        if (mapped.length > 0) {
          setRemoteQuestions(mapped)
          // 重置索引和状态，避免旧题目残留
          setCurrentQuestionIndex(0)
          setSelectedWords([])
          setAvailableWords([])
          setKeyboardInput("")
          setIsChecked(false)
          setIsCorrect(false)
        }
      } catch (error) {
        console.error("加载云端句子失败", error)
        setRemoteError("加载云端句子失败")
      } finally {
        setLoadingRemote(false)
      }
    }

    loadFromSupabase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [currentQuestionIndex])

  useEffect(() => {
    if (currentQuestion && currentQuestion.words) {
      setAvailableWords(shuffleArray([...currentQuestion.words]))
      // 切换题目时重置朗读状态
      setIsPlaying(false)
      setIsPlayingSlow(false)
    }
  }, [currentQuestionIndex, questions.length]) // 题目集变化或索引变化时重新生成单词库

  // 初始化课程进度（当题目列表变化时更新总题目数）
  useEffect(() => {
    if (courseId && questions.length > 0) {
      updateCourseProgress(courseId, questions.length)
    }
  }, [courseId, questions.length])

  function shuffleArray(array: string[]) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleWordClick = (word: string, fromBank: boolean, index?: number) => {
    if (isChecked) return

    if (fromBank) {
      setSelectedWords([...selectedWords, word])
      setAvailableWords(availableWords.filter((_, i) => (i === index ? false : true)))
    } else {
      if (index !== undefined) {
        const newSelected = [...selectedWords]
        newSelected.splice(index, 1)
        setSelectedWords(newSelected)
        setAvailableWords([...availableWords, word])
      }
    }
  }

  const handleDragStart = (word: string, fromBank: boolean, index: number) => {
    if (isChecked) return
    setDraggedWord({ word, fromBank, index })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnAnswerLine = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedWord) return

    if (draggedWord.fromBank) {
      setSelectedWords([...selectedWords, draggedWord.word])
      setAvailableWords(availableWords.filter((_, i) => i !== draggedWord.index))
    }
    setDraggedWord(null)
  }

  const handleDropOnWordBank = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedWord || draggedWord.fromBank) return

    const newSelected = [...selectedWords]
    newSelected.splice(draggedWord.index, 1)
    setSelectedWords(newSelected)
    setAvailableWords([...availableWords, draggedWord.word])
    setDraggedWord(null)
  }

  // 规范化答案字符串，处理空格和标点符号
  const normalizeAnswer = (answer: string): string => {
    return answer
      .trim()
      .replace(/\s+/g, " ") // 将多个空格替换为单个空格
      .replace(/\s*([,.!?;:])/g, "$1") // 移除标点符号前的空格
      .replace(/([,.!?;:])\s*/g, "$1 ") // 确保标点符号后有空格
      .replace(/\s+$/, "") // 移除末尾空格
      .toLowerCase()
  }

  const handleCheck = () => {
    let userAnswer = ""

    if (inputMode === "drag") {
      userAnswer = selectedWords.join(" ")
    } else {
      userAnswer = keyboardInput.trim()
    }

    // 规范化用户答案和正确答案进行比较
    const normalizedUserAnswer = normalizeAnswer(userAnswer)
    const normalizedCorrectAnswer = normalizeAnswer(currentQuestion.english)

    const correct = normalizedUserAnswer === normalizedCorrectAnswer

    setIsCorrect(correct)
    setIsChecked(true)

    // 保存学习进度
    if (currentQuestion && courseId) {
      // 确保总题目数已设置
      if (questions.length > 0) {
        updateCourseProgress(courseId, questions.length)
      }
      saveCourseProgress(courseId, currentQuestion.id, correct, 0) // timeSpent 会在题目切换时计算
    }

    if (correct) {
      setCorrectCount((prev) => prev + 1)
    } else {
      setShowShake(true)
      setLives(Math.max(0, lives - 1))
      setTimeout(() => setShowShake(false), 500)
    }
  }

  const resetQuestionState = (index: number) => {
    setSelectedWords([])
    if (questions[index] && questions[index].words) {
      setAvailableWords(shuffleArray([...questions[index].words]))
    } else {
      setAvailableWords([])
    }
    setKeyboardInput("")
    setIsChecked(false)
    setIsCorrect(false)
    setShowHint(false)
    setShowShake(false)
    setTimer(0)
  }

  const handleContinue = () => {
    // 停止正在播放的语音
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsPlayingSlow(false)

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      resetQuestionState(nextIndex)
    } else {
      // 课程完成
      const accuracy = Math.round((correctCount / questions.length) * 100)
      setShowCompletion(true)
      if (onComplete) {
        onComplete({
          correct: correctCount,
          total: questions.length,
          accuracy,
        })
      }
    }
  }

  // 错误时重试当前题目：清空答案区和输入，重置状态但不切换题目
  const handleRetry = () => {
    if (!currentQuestion) return
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsPlayingSlow(false)
    resetQuestionState(currentQuestionIndex)
  }

  // 跳过当前题目，直接进入下一题或结束
  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      resetQuestionState(nextIndex)
    } else {
      setShowCompletion(true)
      if (onComplete) {
        onComplete({
          correct: correctCount,
          total: questions.length,
          accuracy,
        })
      }
    }
  }

  // 上一题
  const handlePrev = () => {
    if (currentQuestionIndex === 0) return
    const prevIndex = currentQuestionIndex - 1
    setCurrentQuestionIndex(prevIndex)
    resetQuestionState(prevIndex)
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedWords([])
    if (questions[0] && questions[0].words) {
      setAvailableWords(shuffleArray([...questions[0].words]))
    } else {
      setAvailableWords([])
    }
    setKeyboardInput("")
    setIsChecked(false)
    setIsCorrect(false)
    setLives(3)
    setShowHint(false)
    setTimer(0)
    setCorrectCount(0)
    setShowCompletion(false)
  }

  const playAudio = () => {
    if (isPlaying || isPlayingSlow) return // 如果正在播放，不重复播放

    setIsPlaying(true)
    setShowAudioRipple(true)

    // 使用 Web Speech API 朗读
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.english)
      utterance.lang = "en-US"
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        setIsPlaying(false)
        setShowAudioRipple(false)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setShowAudioRipple(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      // 如果不支持 Web Speech API，使用视觉反馈
      setTimeout(() => {
        setIsPlaying(false)
        setShowAudioRipple(false)
      }, 2000)
    }
  }

  const playSlowAudio = () => {
    if (isPlaying || isPlayingSlow) return // 如果正在播放，不重复播放

    setIsPlayingSlow(true)
    setShowSlowAudioRipple(true)

    // 使用 Web Speech API 慢速朗读
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.english)
      utterance.lang = "en-US"
      utterance.rate = 0.6 // 慢速
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        setIsPlayingSlow(false)
        setShowSlowAudioRipple(false)
      }

      utterance.onerror = () => {
        setIsPlayingSlow(false)
        setShowSlowAudioRipple(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      // 如果不支持 Web Speech API，使用视觉反馈
      setTimeout(() => {
        setIsPlayingSlow(false)
        setShowSlowAudioRipple(false)
      }, 3000)
    }
  }

  const getHint = () => {
    const firstWord = currentQuestion.english.split(" ")[0]
    return firstWord
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* 简单的撒花效果 */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute inset-0"
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -50, opacity: 0, x: Math.random() * 100 + "%" }}
                animate={{ y: "120vh", opacity: 1 }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 1.5,
                  repeat: Infinity,
                }}
                className="absolute text-2xl"
              >
                {["🎉", "✨", "🎈", "🌟"][i % 4]}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 w-full max-w-xl bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-blue-100 p-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">练习完成！</h1>
            <p className="text-gray-600">Lesson Complete 🎉</p>
          </div>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-sm text-gray-500">本次题目</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">答对题目</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{correctCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">正确率</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{accuracy}%</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 text-lg font-semibold"
              onClick={() => {
                if (onBack) {
                  onBack()
                } else {
                  router.push("/")
                }
              }}
            >
              返回主页
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-2xl py-6 text-lg font-semibold"
              onClick={handleRestart}
            >
              再练一次
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">课程未找到</p>
          {onBack && (
            <Button onClick={onBack} className="mt-4">
              返回
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full hover:bg-muted"
            onClick={onBack}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>

          <div className="flex-1">
            <Progress value={progress} className="h-3 bg-gray-200" />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} className={`h-5 w-5 ${i < lives ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-medium tabular-nums">{formatTimer(timer)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-32">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: showShake ? [1, 1.02, 0.98, 1.02, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{currentQuestion.chinese}</h2>
            <p className="text-gray-500 text-sm">将这句话翻译成英语</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setInputMode("drag")}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                  inputMode === "drag" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                拖拽模式
              </button>
              <button
                onClick={() => setInputMode("type")}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                  inputMode === "type" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                输入模式
              </button>
            </div>
          </div>

          {inputMode === "drag" ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDropOnAnswerLine}
                className={`min-h-24 rounded-2xl p-4 mb-6 border-3 transition-colors ${
                  isChecked && isCorrect
                    ? "bg-green-50 border-green-500 border-solid"
                    : isChecked && !isCorrect
                      ? "bg-red-50 border-red-500 border-solid"
                      : "bg-white border-dashed border-gray-300"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {selectedWords.length === 0 ? (
                    <p className="text-gray-400 italic">点击或拖拽单词到这里...</p>
                  ) : (
                    selectedWords.map((word, index) => (
                      <motion.button
                        key={`selected-${word}-${index}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        draggable={!isChecked}
                        onDragStart={() => handleDragStart(word, false, index)}
                        onClick={() => handleWordClick(word, false, index)}
                        disabled={isChecked}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md border-b-4 border-blue-700 active:border-b-2 active:translate-y-0.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {word}
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {isChecked && !isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                  <p className="text-red-700 text-sm font-medium mb-1">正确答案：</p>
                  <p className="text-red-900 font-bold text-lg">{currentQuestion.english}</p>
                </motion.div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">单词库</p>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDropOnWordBank}
                  className="flex flex-wrap gap-2 min-h-16"
                >
                  {availableWords.map((word, index) => (
                    <motion.button
                      key={`available-${word}-${index}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      draggable={!isChecked}
                      onDragStart={() => handleDragStart(word, true, index)}
                      onClick={() => handleWordClick(word, true, index)}
                      disabled={isChecked}
                      className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-xl font-medium hover:bg-gray-50 hover:border-blue-400 transition-all shadow-sm border-b-4 border-gray-400 active:border-b-2 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {word}
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 relative">
                <Textarea
                  value={keyboardInput}
                  onChange={(e) => setKeyboardInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (!isChecked) {
                        if (keyboardInput.trim()) {
                          handleCheck()
                        }
                      } else {
                        // 结果状态：回车进入下一题或重试
                        if (isCorrect) {
                          handleContinue()
                        } else {
                          handleRetry()
                        }
                      }
                    }
                  }}
                  placeholder="在这里输入你的答案..."
                  disabled={isChecked}
                  className={`min-h-28 text-lg rounded-2xl resize-none pr-12 border-3 transition-colors ${
                    isChecked && isCorrect
                      ? "border-green-500 bg-green-50"
                      : isChecked && !isCorrect
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500"
                  }`}
                  autoFocus
                />
                {keyboardInput && !isChecked && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setKeyboardInput("")}
                    className="absolute top-3 right-3 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </Button>
                )}
              </div>

              {isChecked && !isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                  <p className="text-red-700 text-sm font-medium mb-1">正确答案：</p>
                  <p className="text-red-900 font-bold text-lg">{currentQuestion.english}</p>
                </motion.div>
              )}
            </>
          )}

          {!isChecked && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleCheck}
                disabled={
                  (inputMode === "drag" && selectedWords.length === 0) ||
                  (inputMode === "type" && !keyboardInput.trim())
                }
                size="lg"
                className="px-16 py-7 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-800 active:border-b-2 active:translate-y-0.5"
              >
                检查
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  onClick={playAudio}
                  size="icon"
                  variant="ghost"
                  disabled={isPlaying || isPlayingSlow}
                  className={`rounded-full hover:bg-blue-50 relative z-10 transition-all ${
                    isPlaying ? "bg-blue-100 animate-pulse" : ""
                  }`}
                >
                  <Volume2 className={`h-5 w-5 ${isPlaying ? "text-blue-700" : "text-blue-600"}`} />
                </Button>
                <AnimatePresence>
                  {showAudioRipple && (
                    <>
                      <motion.div
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="absolute inset-0 bg-blue-300 rounded-full"
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <Button
                  onClick={playSlowAudio}
                  size="icon"
                  variant="ghost"
                  disabled={isPlaying || isPlayingSlow}
                  className={`rounded-full hover:bg-purple-50 relative z-10 transition-all ${
                    isPlayingSlow ? "bg-purple-100 animate-pulse" : ""
                  }`}
                >
                  <Volume1 className={`h-5 w-5 ${isPlayingSlow ? "text-purple-700" : "text-purple-600"}`} />
                </Button>
                <AnimatePresence>
                  {showSlowAudioRipple && (
                    <>
                      <motion.div
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-purple-400 rounded-full"
                      />
                      <motion.div
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="absolute inset-0 bg-purple-300 rounded-full"
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full hover:bg-yellow-50"
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                </Button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-20"
                    >
                      提示：以 "{getHint()}" 开头
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一题
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSkip}
                className="rounded-full"
              >
                跳过
              </Button>
              <div className="text-xs text-gray-400">
                {inputMode === "type" ? "按 Enter 提交 / 查看结果" : "点击单词构建你的答案"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 p-6 ${
              isCorrect ? "bg-green-500" : "bg-red-500"
            } text-white shadow-2xl z-50`}
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isCorrect ? (
                  <CheckCircle2 className="h-12 w-12 flex-shrink-0" />
                ) : (
                  <XCircle className="h-12 w-12 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-2xl font-bold mb-1">{isCorrect ? "太棒了！" : "不对"}</h3>
                  <p className="text-white/90 text-sm">
                    {isCorrect ? "你进步很大！" : "查看正确答案后再试一次"}
                  </p>
                </div>
              </div>
              <Button
                onClick={isCorrect ? handleContinue : handleRetry}
                size="lg"
                className="px-8 py-6 text-lg font-bold rounded-2xl shadow-lg bg-white text-gray-800 hover:bg-gray-100"
              >
                {isCorrect ? "继续" : "重试"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

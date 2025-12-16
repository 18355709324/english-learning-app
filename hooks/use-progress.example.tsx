/**
 * useProgress Hook 使用示例
 * 
 * 这个文件展示了如何在组件中使用 useProgress Hook
 */

import { useProgress } from "./use-progress"

// 示例组件：展示如何使用 useProgress
export function ProgressExample() {
  const {
    progress,
    isLoading,
    markLessonCompleted,
    setCurrentLesson,
    isLessonCompleted,
    getCurrentLessonId,
    getCompletedCount,
    clearProgress,
  } = useProgress()

  if (isLoading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <h2>学习进度管理示例</h2>
      
      {/* 显示当前学习的课程 */}
      <div>
        <p>当前学习的课程: {progress.currentLessonId || "无"}</p>
        <p>已完成的课程数: {getCompletedCount()}</p>
        <p>已完成的课程ID: {progress.completedLessonIds.join(", ") || "无"}</p>
      </div>

      {/* 操作按钮 */}
      <div>
        <button onClick={() => setCurrentLesson("daily-conversation")}>
          设置当前课程为"日常对话"
        </button>
        <button onClick={() => markLessonCompleted("daily-conversation")}>
          标记"日常对话"为已完成
        </button>
        <button onClick={() => clearProgress()}>
          清空进度
        </button>
      </div>

      {/* 检查课程状态 */}
      <div>
        <p>
          "日常对话"是否已完成: {isLessonCompleted("daily-conversation") ? "是" : "否"}
        </p>
      </div>
    </div>
  )
}


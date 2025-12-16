// 课程数据结构和课程定义

export type LessonStatus = "locked" | "in-progress" | "completed"

export interface Question {
  id: number
  chinese: string
  english: string
  words: string[]
}

export interface Course {
  id: string
  title: string
  description: string
  icon: string
  color: string
  level: "beginner" | "intermediate" | "advanced"
  duration: string
  questionCount: number
  questions: Question[]
  status: LessonStatus
  progress: number
  lastPracticed?: string
}

// 日常对话课程
const dailyConversationQuestions: Question[] = [
  {
    id: 1,
    chinese: "你好，很高兴见到你。",
    english: "Hello, nice to meet you.",
    words: ["Hello", ",", "nice", "to", "meet", "you", "."],
  },
  {
    id: 2,
    chinese: "今天天气真好。",
    english: "The weather is really nice today.",
    words: ["The", "weather", "is", "really", "nice", "today", "."],
  },
  {
    id: 3,
    chinese: "你周末有什么计划？",
    english: "What are your plans for the weekend?",
    words: ["What", "are", "your", "plans", "for", "the", "weekend", "?"],
  },
  {
    id: 4,
    chinese: "我喜欢喝咖啡。",
    english: "I like to drink coffee.",
    words: ["I", "like", "to", "drink", "coffee", "."],
  },
  {
    id: 5,
    chinese: "她每天早上跑步。",
    english: "She runs every morning.",
    words: ["She", "runs", "every", "morning", "."],
  },
]

// 购物场景课程
const shoppingQuestions: Question[] = [
  {
    id: 6,
    chinese: "这个多少钱？",
    english: "How much does this cost?",
    words: ["How", "much", "does", "this", "cost", "?"],
  },
  {
    id: 7,
    chinese: "我可以试穿这件衣服吗？",
    english: "Can I try on this shirt?",
    words: ["Can", "I", "try", "on", "this", "shirt", "?"],
  },
  {
    id: 8,
    chinese: "你们接受信用卡吗？",
    english: "Do you accept credit cards?",
    words: ["Do", "you", "accept", "credit", "cards", "?"],
  },
  {
    id: 9,
    chinese: "这个有折扣吗？",
    english: "Is there a discount on this?",
    words: ["Is", "there", "a", "discount", "on", "this", "?"],
  },
  {
    id: 10,
    chinese: "我要买两件。",
    english: "I would like to buy two of these.",
    words: ["I", "would", "like", "to", "buy", "two", "of", "these", "."],
  },
]

// 餐厅场景课程
const restaurantQuestions: Question[] = [
  {
    id: 11,
    chinese: "请给我一份菜单。",
    english: "Could I have a menu, please?",
    words: ["Could", "I", "have", "a", "menu", ",", "please", "?"],
  },
  {
    id: 12,
    chinese: "我想点一份意大利面。",
    english: "I would like to order some pasta.",
    words: ["I", "would", "like", "to", "order", "some", "pasta", "."],
  },
  {
    id: 13,
    chinese: "这道菜辣吗？",
    english: "Is this dish spicy?",
    words: ["Is", "this", "dish", "spicy", "?"],
  },
  {
    id: 14,
    chinese: "请给我账单。",
    english: "Could I have the bill, please?",
    words: ["Could", "I", "have", "the", "bill", ",", "please", "?"],
  },
  {
    id: 15,
    chinese: "这里的食物很好吃。",
    english: "The food here is very delicious.",
    words: ["The", "food", "here", "is", "very", "delicious", "."],
  },
]

// 旅行场景课程
const travelQuestions: Question[] = [
  {
    id: 16,
    chinese: "请问机场怎么走？",
    english: "How do I get to the airport?",
    words: ["How", "do", "I", "get", "to", "the", "airport", "?"],
  },
  {
    id: 17,
    chinese: "我想预订一个房间。",
    english: "I would like to book a room.",
    words: ["I", "would", "like", "to", "book", "a", "room", "."],
  },
  {
    id: 18,
    chinese: "这附近有好的餐厅吗？",
    english: "Are there any good restaurants nearby?",
    words: ["Are", "there", "any", "good", "restaurants", "nearby", "?"],
  },
  {
    id: 19,
    chinese: "我可以拍张照片吗？",
    english: "Can I take a photo here?",
    words: ["Can", "I", "take", "a", "photo", "here", "?"],
  },
  {
    id: 20,
    chinese: "这个景点什么时候开放？",
    english: "What time does this attraction open?",
    words: ["What", "time", "does", "this", "attraction", "open", "?"],
  },
]

// 工作场景课程
const workQuestions: Question[] = [
  {
    id: 21,
    chinese: "会议什么时候开始？",
    english: "What time does the meeting start?",
    words: ["What", "time", "does", "the", "meeting", "start", "?"],
  },
  {
    id: 22,
    chinese: "我需要发送这封邮件。",
    english: "I need to send this email.",
    words: ["I", "need", "to", "send", "this", "email", "."],
  },
  {
    id: 23,
    chinese: "你能帮我一个忙吗？",
    english: "Could you do me a favor?",
    words: ["Could", "you", "do", "me", "a", "favor", "?"],
  },
  {
    id: 24,
    chinese: "这个项目什么时候截止？",
    english: "When is the deadline for this project?",
    words: ["When", "is", "the", "deadline", "for", "this", "project", "?"],
  },
  {
    id: 25,
    chinese: "我今天工作很忙。",
    english: "I am very busy at work today.",
    words: ["I", "am", "very", "busy", "at", "work", "today", "."],
  },
]

// 学习场景课程
const learningQuestions: Question[] = [
  {
    id: 26,
    chinese: "我正在学习英语。",
    english: "I am learning English.",
    words: ["I", "am", "learning", "English", "."],
  },
  {
    id: 27,
    chinese: "这个单词怎么发音？",
    english: "How do you pronounce this word?",
    words: ["How", "do", "you", "pronounce", "this", "word", "?"],
  },
  {
    id: 28,
    chinese: "你能再说一遍吗？",
    english: "Could you say that again?",
    words: ["Could", "you", "say", "that", "again", "?"],
  },
  {
    id: 29,
    chinese: "我需要多练习口语。",
    english: "I need to practice speaking more.",
    words: ["I", "need", "to", "practice", "speaking", "more", "."],
  },
  {
    id: 30,
    chinese: "这本书对我很有帮助。",
    english: "This book is very helpful for me.",
    words: ["This", "book", "is", "very", "helpful", "for", "me", "."],
  },
]

// 交通场景课程
const transportationQuestions: Question[] = [
  {
    id: 31,
    chinese: "司机不找零。",
    english: "The driver doesn't give change.",
    words: ["The", "driver", "doesn't", "give", "change", "."],
  },
  {
    id: 32,
    chinese: "下一站是哪里？",
    english: "What is the next stop?",
    words: ["What", "is", "the", "next", "stop", "?"],
  },
  {
    id: 33,
    chinese: "到市中心需要多长时间？",
    english: "How long does it take to get to the city center?",
    words: ["How", "long", "does", "it", "take", "to", "get", "to", "the", "city", "center", "?"],
  },
  {
    id: 34,
    chinese: "请在这里停车。",
    english: "Please stop here.",
    words: ["Please", "stop", "here", "."],
  },
  {
    id: 35,
    chinese: "我迷路了。",
    english: "I am lost.",
    words: ["I", "am", "lost", "."],
  },
]

// 健康场景课程
const healthQuestions: Question[] = [
  {
    id: 36,
    chinese: "我感觉不舒服。",
    english: "I don't feel well.",
    words: ["I", "don't", "feel", "well", "."],
  },
  {
    id: 37,
    chinese: "我需要看医生。",
    english: "I need to see a doctor.",
    words: ["I", "need", "to", "see", "a", "doctor", "."],
  },
  {
    id: 38,
    chinese: "你哪里不舒服？",
    english: "What's wrong with you?",
    words: ["What's", "wrong", "with", "you", "?"],
  },
  {
    id: 39,
    chinese: "我头疼。",
    english: "I have a headache.",
    words: ["I", "have", "a", "headache", "."],
  },
  {
    id: 40,
    chinese: "记得多喝水。",
    english: "Remember to drink more water.",
    words: ["Remember", "to", "drink", "more", "water", "."],
  },
]

// 时间表达课程
const timeQuestions: Question[] = [
  {
    id: 41,
    chinese: "现在几点了？",
    english: "What time is it now?",
    words: ["What", "time", "is", "it", "now", "?"],
  },
  {
    id: 42,
    chinese: "我们明天见面吧。",
    english: "Let's meet tomorrow.",
    words: ["Let's", "meet", "tomorrow", "."],
  },
  {
    id: 43,
    chinese: "我通常七点起床。",
    english: "I usually wake up at seven o'clock.",
    words: ["I", "usually", "wake", "up", "at", "seven", "o'clock", "."],
  },
  {
    id: 44,
    chinese: "会议推迟到下午了。",
    english: "The meeting has been postponed to the afternoon.",
    words: ["The", "meeting", "has", "been", "postponed", "to", "the", "afternoon", "."],
  },
  {
    id: 45,
    chinese: "我迟到了，很抱歉。",
    english: "I am sorry for being late.",
    words: ["I", "am", "sorry", "for", "being", "late", "."],
  },
]

// 情感表达课程
const emotionQuestions: Question[] = [
  {
    id: 46,
    chinese: "我很高兴见到你。",
    english: "I am very happy to see you.",
    words: ["I", "am", "very", "happy", "to", "see", "you", "."],
  },
  {
    id: 47,
    chinese: "谢谢你的帮助。",
    english: "Thank you for your help.",
    words: ["Thank", "you", "for", "your", "help", "."],
  },
  {
    id: 48,
    chinese: "不客气。",
    english: "You're welcome.",
    words: ["You're", "welcome", "."],
  },
  {
    id: 49,
    chinese: "祝你今天愉快。",
    english: "Have a nice day.",
    words: ["Have", "a", "nice", "day", "."],
  },
  {
    id: 50,
    chinese: "我很抱歉。",
    english: "I am very sorry.",
    words: ["I", "am", "very", "sorry", "."],
  },
]

// 所有课程定义
export const courses: Course[] = [
  {
    id: "daily-conversation",
    title: "日常对话",
    description: "学习基本的日常交流用语",
    icon: "💬",
    color: "from-blue-500 to-cyan-500",
    level: "beginner",
    duration: "5 min",
    questionCount: dailyConversationQuestions.length,
    questions: dailyConversationQuestions,
    status: "in-progress",
    progress: 40,
    lastPracticed: "Today",
  },
  {
    id: "shopping",
    title: "购物场景",
    description: "掌握购物时的常用表达",
    icon: "🛍️",
    color: "from-purple-500 to-pink-500",
    level: "beginner",
    duration: "6 min",
    questionCount: shoppingQuestions.length,
    questions: shoppingQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "restaurant",
    title: "餐厅场景",
    description: "学会在餐厅点餐和交流",
    icon: "🍽️",
    color: "from-orange-500 to-red-500",
    level: "beginner",
    duration: "7 min",
    questionCount: restaurantQuestions.length,
    questions: restaurantQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "travel",
    title: "旅行场景",
    description: "旅行必备的英语表达",
    icon: "✈️",
    color: "from-teal-500 to-green-500",
    level: "intermediate",
    duration: "8 min",
    questionCount: travelQuestions.length,
    questions: travelQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "work",
    title: "工作场景",
    description: "职场英语交流技巧",
    icon: "💼",
    color: "from-indigo-500 to-blue-500",
    level: "intermediate",
    duration: "8 min",
    questionCount: workQuestions.length,
    questions: workQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "learning",
    title: "学习场景",
    description: "关于学习的英语表达",
    icon: "📚",
    color: "from-yellow-500 to-orange-500",
    level: "beginner",
    duration: "6 min",
    questionCount: learningQuestions.length,
    questions: learningQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "transportation",
    title: "交通场景",
    description: "出行和交通相关表达",
    icon: "🚗",
    color: "from-gray-500 to-slate-500",
    level: "beginner",
    duration: "5 min",
    questionCount: transportationQuestions.length,
    questions: transportationQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "health",
    title: "健康场景",
    description: "看病和健康相关表达",
    icon: "🏥",
    color: "from-red-500 to-pink-500",
    level: "intermediate",
    duration: "6 min",
    questionCount: healthQuestions.length,
    questions: healthQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "time",
    title: "时间表达",
    description: "学习时间相关的英语表达",
    icon: "⏰",
    color: "from-violet-500 to-purple-500",
    level: "beginner",
    duration: "7 min",
    questionCount: timeQuestions.length,
    questions: timeQuestions,
    status: "in-progress",
    progress: 0,
  },
  {
    id: "emotion",
    title: "情感表达",
    description: "表达情感和礼貌用语",
    icon: "😊",
    color: "from-rose-500 to-pink-500",
    level: "beginner",
    duration: "5 min",
    questionCount: emotionQuestions.length,
    questions: emotionQuestions,
    status: "in-progress",
    progress: 0,
  },
]

// 根据ID获取课程（包括自定义课程）
export function getCourseById(id: string): Course | undefined {
  // 先检查系统课程
  const systemCourse = courses.find((course) => course.id === id)
  if (systemCourse) return systemCourse
  
  // 再检查自定义课程
  if (typeof window !== "undefined") {
    const { getCustomCourseById } = require("./course-manager")
    return getCustomCourseById(id)
  }
  
  return undefined
}

// 获取所有课程（包括自定义课程）
export function getAllCourses(): Course[] {
  const allCourses = [...courses]
  
  // 添加自定义课程
  if (typeof window !== "undefined") {
    const { getCustomCourses } = require("./course-manager")
    const customCourses = getCustomCourses()
    allCourses.push(...customCourses)
  }
  
  return allCourses
}


"use server"

import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const apiKey = process.env.DEEPSEEK_API_KEY
const baseURL = process.env.DEEPSEEK_BASE_URL

if (!apiKey || !baseURL) {
  console.warn(
    "[generate-sentences] Missing DEEPSEEK_API_KEY or DEEPSEEK_BASE_URL. AI 生成功能将不可用。",
  )
}

const client =
  apiKey && baseURL
    ? new OpenAI({
        apiKey,
        baseURL,
      })
    : null

type GeneratedSentence = {
  cn: string
  en: string
  words: string[]
}

export async function POST(req: NextRequest) {
  if (!client) {
    return NextResponse.json(
      { error: "DeepSeek 未配置，请先在环境变量中设置 DEEPSEEK_API_KEY 和 DEEPSEEK_BASE_URL。" },
      { status: 500 },
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const topic = typeof body.topic === "string" && body.topic.trim() ? body.topic.trim() : "Daily English"
    const countRaw = Number(body.count)
    const count = Number.isFinite(countRaw) && countRaw > 0 && countRaw <= 50 ? countRaw : 20
    const level =
      typeof body.level === "string" && body.level.trim()
        ? body.level.trim()
        : "中等难度"

    const systemPrompt = `
你是一个专业的英语教材编写者。请根据用户提供的主题，生成 ${count} 组实用的中英对话例句。

严格要求：
- 返回纯 JSON 数组格式，不要包含 json 代码块标记，不要包含任何其他文字。
- 数据结构必须为：[{ "cn": "中文意思", "en": "English sentence", "words": ["拆分", "单", "词"] }]
- words 数组中，请将单词和标点符号（如 ? . ! ,）作为单独的项拆分。
- 分词必须尽量符合英语自然拼读习惯，缩写词（如 don't, I'm, can't）作为一个整体，标点符号 (. ? ! ,) 作为单独元素。
- 难度为：${level}，语境贴近生活和真实对话。
`.trim()

    const userPrompt = `主题 (topic): ${topic}\n难度: ${level}\n请生成 ${count} 组中英对话例句。`

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    })

    const rawContent = response.choices?.[0]?.message?.content ?? ""

    // 清理可能的 ```json ``` 包裹
    const cleaned = rawContent
      .trim()
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // 尝试从文本中提取第一个 [...] JSON 数组
      const match = cleaned.match(/\[[\s\S]*\]/)
      if (!match) {
        throw new Error("无法从模型返回中解析 JSON 数组")
      }
      parsed = JSON.parse(match[0])
    }

    if (!Array.isArray(parsed)) {
      throw new Error("解析结果不是 JSON 数组")
    }

    const result: GeneratedSentence[] = parsed
      .map((item: any) => {
        if (!item) return null
        const cn = typeof item.cn === "string" ? item.cn.trim() : ""
        const en = typeof item.en === "string" ? item.en.trim() : ""
        const wordsSource: any[] = Array.isArray(item.words) ? item.words : []

        const words = wordsSource
          .map((w) => (typeof w === "string" ? w.trim() : ""))
          .filter(Boolean)

        if (!cn || !en || words.length === 0) return null
        return { cn, en, words }
      })
      .filter(Boolean) as GeneratedSentence[]

    return NextResponse.json({ items: result }, { status: 200 })
  } catch (error) {
    console.error("[generate-sentences] error", error)
    return NextResponse.json(
      { error: "生成句子失败，请稍后重试。" },
      { status: 500 },
    )
  }
}



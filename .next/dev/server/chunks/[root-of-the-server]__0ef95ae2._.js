module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/generate-sentences/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4046ebf17eb14b9517abf48320ac7b408a9378656c":"POST"},"",""] */ __turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
const apiKey = process.env.DEEPSEEK_API_KEY;
const baseURL = process.env.DEEPSEEK_BASE_URL;
if (!apiKey || !baseURL) {
    console.warn("[generate-sentences] Missing DEEPSEEK_API_KEY or DEEPSEEK_BASE_URL. AI 生成功能将不可用。");
}
const client = apiKey && baseURL ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
    apiKey,
    baseURL
}) : null;
async function POST(req) {
    if (!client) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "DeepSeek 未配置，请先在环境变量中设置 DEEPSEEK_API_KEY 和 DEEPSEEK_BASE_URL。"
        }, {
            status: 500
        });
    }
    try {
        const body = await req.json().catch(()=>({}));
        const topic = typeof body.topic === "string" && body.topic.trim() ? body.topic.trim() : "Daily English";
        const countRaw = Number(body.count);
        const count = Number.isFinite(countRaw) && countRaw > 0 && countRaw <= 50 ? countRaw : 20;
        const level = typeof body.level === "string" && body.level.trim() ? body.level.trim() : "中等难度";
        const systemPrompt = `
你是一个专业的英语教材编写者。请根据用户提供的主题，生成 ${count} 组实用的中英对话例句。

严格要求：
- 返回纯 JSON 数组格式，不要包含 json 代码块标记，不要包含任何其他文字。
- 数据结构必须为：[{ "cn": "中文意思", "en": "English sentence", "words": ["拆分", "单", "词"] }]
- words 数组中，请将单词和标点符号（如 ? . ! ,）作为单独的项拆分。
- 分词必须尽量符合英语自然拼读习惯，缩写词（如 don't, I'm, can't）作为一个整体，标点符号 (. ? ! ,) 作为单独元素。
- 难度为：${level}，语境贴近生活和真实对话。
`.trim();
        const userPrompt = `主题 (topic): ${topic}\n难度: ${level}\n请生成 ${count} 组中英对话例句。`;
        const response = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.7
        });
        const rawContent = response.choices?.[0]?.message?.content ?? "";
        // 清理可能的 ```json ``` 包裹
        const cleaned = rawContent.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch  {
            // 尝试从文本中提取第一个 [...] JSON 数组
            const match = cleaned.match(/\[[\s\S]*\]/);
            if (!match) {
                throw new Error("无法从模型返回中解析 JSON 数组");
            }
            parsed = JSON.parse(match[0]);
        }
        if (!Array.isArray(parsed)) {
            throw new Error("解析结果不是 JSON 数组");
        }
        const result = parsed.map((item)=>{
            if (!item) return null;
            const cn = typeof item.cn === "string" ? item.cn.trim() : "";
            const en = typeof item.en === "string" ? item.en.trim() : "";
            const wordsSource = Array.isArray(item.words) ? item.words : [];
            const words = wordsSource.map((w)=>typeof w === "string" ? w.trim() : "").filter(Boolean);
            if (!cn || !en || words.length === 0) return null;
            return {
                cn,
                en,
                words
            };
        }).filter(Boolean);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            items: result
        }, {
            status: 200
        });
    } catch (error) {
        console.error("[generate-sentences] error", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "生成句子失败，请稍后重试。"
        }, {
            status: 500
        });
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    POST
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(POST, "4046ebf17eb14b9517abf48320ac7b408a9378656c", null);
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ef95ae2._.js.map
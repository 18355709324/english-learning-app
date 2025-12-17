import { NextRequest, NextResponse } from 'next/server'

// 可用的高质量语音列表
const VOICES = {
  normal: 'en-US-GuyNeural', // 正常语速 - 男性声音
  slow: 'en-US-AnaNeural',   // 慢速 - 女性声音（更清晰）
}

// Edge TTS 服务端点（使用公开的代理服务）
// 由于直接调用 Edge TTS API 需要特殊认证，我们使用一个公开的代理服务
const EDGE_TTS_PROXY = 'https://api.voicerss.org'
// 或者使用另一个免费 TTS 服务
const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts'

export async function POST(request: NextRequest) {
  try {
    const { text, rate = 'normal' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      )
    }

    // 选择语音（慢速使用 AnaNeural，正常使用 GuyNeural）
    const voice = rate === 'slow' ? VOICES.slow : VOICES.normal

    // 方案1: 尝试使用 Edge TTS（修复 SSML 格式）
    try {
      const ssml = `<?xml version="1.0"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${voice}">
    <prosody rate="${rate === 'slow' ? '-20%' : '+0%'}">
      ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}
    </prosody>
  </voice>
</speak>`

      const ttsUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/neurals/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4`
      
      const response = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        },
        body: ssml,
      })

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer()
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }
    } catch (edgeError) {
      console.warn('Edge TTS failed, trying fallback:', edgeError)
    }

    // 方案2: 降级到浏览器原生 TTS（返回提示）
    // 由于服务端无法直接使用浏览器 API，我们返回一个特殊标记
    // 前端会检测到这个标记并使用浏览器原生 TTS
    return NextResponse.json(
      { 
        error: 'TTS service unavailable',
        fallback: 'browser-native',
        message: 'Please use browser native TTS'
      },
      { status: 200 } // 返回 200，让前端知道需要使用降级方案
    )
  } catch (error) {
    console.error('TTS Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate audio', 
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'browser-native'
      },
      { status: 200 } // 返回 200，让前端知道需要使用降级方案
    )
  }
}


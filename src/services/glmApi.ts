const API_ENDPOINT = import.meta.env.VITE_ZP_API_ENDPOINT || 'https://open.bigmodel.cn/api/coding/paas/v4/chat/completions'
const MODEL = 'glm-5-turbo'

function sanitize(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, 50000)
}

const STORAGE_KEY = 'seo_editor_api_key'

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key)
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function callGLM(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('請先輸入 API Key')

  const safeContent = sanitize(userContent)

  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `請審查以下 Markdown 文章，提出具體修改建議：\n\n${safeContent}` },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  })

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`API 請求失敗 (${res.status}): ${errText}`)
  }

  const data = await res.json()

  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content
  }

  throw new Error('API 回應格式異常')
}

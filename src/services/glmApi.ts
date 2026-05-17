import type { EditorRole } from '../types'

const API_ENDPOINT = import.meta.env.VITE_ZP_API_ENDPOINT || 'https://open.bigmodel.cn/api/coding/paas/v4/chat/completions'
const MODEL = 'glm-5-turbo'
const MIN_MAX_TOKENS = 256
const DEFAULT_MAX_TOKENS = 8192
const PROVIDER_MAX_TOKENS = 16384
const SECTION_GROUP_SIZE = 2
const CONTINUATION_TAIL_CHARS = 4000
const MAX_CONTINUATIONS = 3
export const END_OF_PART_MARKER = '[[END_OF_PART]]'

interface ReviewSection {
  id: string
  title: string
  instructions: string
}

interface GLMChoice {
  message?: { content?: string }
  finish_reason?: string
}

interface GLMUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

interface GLMResponse {
  choices?: GLMChoice[]
  usage?: GLMUsage
}

interface CompletionResult {
  content: string
  finishReason?: string
  usage?: GLMUsage
}

interface ContinueCheckInput {
  content: string
  finishReason?: string
  completionTokens?: number
  maxTokens?: number
}

const REVIEW_SECTIONS: Record<EditorRole, ReviewSection[]> = {
  nineGrid: [
    { id: 'S1', title: '文章結構診斷', instructions: '分析文章整體結構，是否具備清晰的邏輯順序。' },
    { id: 'S2', title: '資訊/感受比例', instructions: '評估客觀資訊與主觀感受是否兼具且交織穿插。' },
    { id: 'S3', title: '自問自答完整度', instructions: '用 7W3H 檢視已回答與遺漏的問題，特別注意 Why 和 How。' },
    { id: 'S4', title: '基礎問題 vs 鏟子問題', instructions: '分析內容深度，指出是否有足夠的個人經驗與獨特觀點。' },
    { id: 'S5', title: '具體修改建議', instructions: '逐段提出可執行修改建議，指出補充、刪減、重排位置。' },
    { id: 'S6', title: 'SEO 技術建議', instructions: '針對標題、關鍵字、結構、連結、meta、圖片 alt 等提出建議。' },
  ],
  sourcing: [
    { id: 'S1', title: '內容三角評估', instructions: '從人、主題、風格三角評估必要性、說服力與讀者體驗。' },
    { id: 'S2', title: '資訊稀有性檢查', instructions: '指出只在這裡才讀得到的內容，以及需要補強的已知資訊。' },
    { id: 'S3', title: '課題鏡射性評估', instructions: '判斷讀者是否會覺得這是我的事，並檢查讀者橋梁。' },
    { id: 'S4', title: '結構強韌性分析', instructions: '檢查文章設計圖、邏輯遞進、標題層級與長度結構匹配。' },
    { id: 'S5', title: '取材品質評估', instructions: '評估文章是否呈現取材者態度、回信精神與對讀者的敬意。' },
    { id: 'S6', title: '具體修改建議', instructions: '逐段提出稀有性、橋梁、結構與主題翻轉的修改建議。' },
  ],
  positioning: [
    { id: 'S1', title: '心智位置診斷', instructions: '判斷文章佔據新手入口、決策指南、錯誤修正、操作手冊、權威整理或轉換前哨哪個位置。' },
    { id: 'S2', title: '搜尋意圖匹配', instructions: '推定搜尋者真正想解決的問題，檢查文章是否回應此問題。' },
    { id: 'S3', title: '定位句提煉', instructions: '寫出「這篇文章要成為誰在搜尋什麼時用來做什麼的什麼類型」定位句。' },
    { id: 'S4', title: '競品差異化分析', instructions: '判斷刪掉品牌名和作者名後，文章是否仍有獨特角度。' },
    { id: 'S5', title: '標題與導言一致性', instructions: '檢查標題承諾、導言情境、H2 任務順序與 CTA 下一步是否一致。' },
    { id: 'S6', title: '具體修改建議', instructions: '指出該刪除、強化、改標題、重排 H2 的位置。' },
    { id: 'S7', title: '定位優化後的標題建議', instructions: '提供 3 個替代標題，同時包含關鍵字、讀者情境與明確價值。' },
  ],
  branding: [
    { id: 'S1', title: '品牌承諾識別', instructions: '識別文章背後品牌或作者向讀者承諾的感覺。' },
    { id: 'S2', title: '目標受眾評估', instructions: '判斷受眾是否精準，是否試圖討好所有人。' },
    { id: 'S3', title: '感覺承諾檢查', instructions: '判斷讀者讀完後會得到什麼感覺，並與品牌定位比對。' },
    { id: 'S4', title: '轉行測試', instructions: '測試品牌個性移植到其他領域時是否仍鮮明可辨。' },
    { id: 'S5', title: 'Logo vs 品牌檢查', instructions: '檢查品牌元素是否只有名稱標記卻缺少內涵。' },
    { id: 'S6', title: '承諾兌現 × 期待滿足', instructions: '檢查文章承諾是否兌現、讀者期待是否被滿足。' },
    { id: 'S7', title: '具體修改建議', instructions: '提出品牌承諾、受眾、感覺層、品牌故事與接觸點一致性的修改建議。' },
    { id: 'S8', title: 'Tagline 建議', instructions: '提供 2-3 個 Tagline，格式為品牌個性、核心感覺、目標用戶視角。' },
  ],
}

function sanitize(input: string): string {
  return Array.from(input)
    .filter((char) => {
      const code = char.charCodeAt(0)
      return (code > 31 && code !== 127) || code === 9 || code === 10 || code === 13
    })
    .join('')
    .slice(0, 50000)
}

export function clampMaxTokens(rawValue: string | number | undefined = import.meta.env.VITE_ZP_MAX_TOKENS): number {
  const parsed = typeof rawValue === 'number' ? rawValue : Number.parseInt(rawValue ?? '', 10)
  const requested = Number.isFinite(parsed) ? parsed : DEFAULT_MAX_TOKENS
  const clamped = Math.min(Math.max(requested, MIN_MAX_TOKENS), PROVIDER_MAX_TOKENS)

  if (requested !== clamped) {
    console.warn('[GLM] VITE_ZP_MAX_TOKENS clamped', { requested, clamped })
  }

  return clamped
}

export function stripEndMarker(content: string): string {
  return content.replaceAll(END_OF_PART_MARKER, '').trim()
}

export function tailWindow(content: string, maxChars = CONTINUATION_TAIL_CHARS): string {
  return content.length <= maxChars ? content : content.slice(-maxChars)
}

export function shouldContinue(input: ContinueCheckInput): boolean {
  if (input.content.includes(END_OF_PART_MARKER)) return false
  if (input.finishReason === 'length') return true
  if (input.maxTokens && input.completionTokens) {
    return input.completionTokens >= Math.floor(input.maxTokens * 0.98)
  }
  return false
}

export function getSectionGroups(role: EditorRole, groupSize = SECTION_GROUP_SIZE): ReviewSection[][] {
  const sections = REVIEW_SECTIONS[role]
  const groups: ReviewSection[][] = []

  for (let index = 0; index < sections.length; index += groupSize) {
    groups.push(sections.slice(index, index + groupSize))
  }

  return groups
}

export function mergeSectionOutputs(role: EditorRole, outputs: Map<string, string>): string {
  return REVIEW_SECTIONS[role]
    .map(section => outputs.get(section.id)?.trim())
    .filter((content): content is string => Boolean(content))
    .join('\n\n')
}

function buildSectionInstructions(role: EditorRole, sectionIds: string[]): string {
  const requested = new Set(sectionIds)
  return REVIEW_SECTIONS[role]
    .filter(section => requested.has(section.id))
    .map(section => `- ${section.id}: ${section.title}\n  ${section.instructions}`)
    .join('\n')
}

function buildUserPrompt(article: string, role?: EditorRole, sectionIds?: string[]): string {
  if (!role || !sectionIds?.length) {
    return `請審查以下 Markdown 文章，提出具體修改建議。最後一行請單獨輸出 ${END_OF_PART_MARKER}。\n\n<<<MARKDOWN\n${article}\nMARKDOWN`
  }

  return `請只輸出以下固定章節，不要新增未指定章節，也不要改變章節順序。\n每個章節標題必須使用「### [章節 ID] 章節標題」格式。\n本輪章節：\n${buildSectionInstructions(role, sectionIds)}\n\n最後一行請單獨輸出 ${END_OF_PART_MARKER}。\n\n請審查以下 Markdown 文章：\n\n<<<MARKDOWN\n${article}\nMARKDOWN`
}

function buildContinuationPrompt(role?: EditorRole, sectionIds?: string[]): string {
  const sectionInstruction = role && sectionIds?.length
    ? `仍然只補完這些章節：${sectionIds.join(', ')}。不要跳到其他章節。`
    : '仍然只補完原本要求的內容。'

  return `前文已保存。請僅從上一段最後一句繼續，不要重複已輸出內容。${sectionInstruction}\n補到完整結束為止，最後一行請單獨輸出 ${END_OF_PART_MARKER}。`
}

function logDebug(event: string, payload: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.debug(`[GLM] ${event}`, payload)
  }
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

async function requestCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, maxTokens: number): Promise<CompletionResult> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('請先輸入 API Key')

  const body = JSON.stringify({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
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

  const data = await res.json() as GLMResponse
  const choice = data.choices?.[0]
  const content = choice?.message?.content

  if (content) {
    return {
      content,
      finishReason: choice?.finish_reason,
      usage: data.usage,
    }
  }

  throw new Error('API 回應格式異常')
}

export async function callGLM(
  systemPrompt: string,
  userContent: string,
  sectionIds?: string[],
  role?: EditorRole,
): Promise<string> {
  const safeContent = sanitize(userContent)
  const maxTokens = clampMaxTokens()
  const baseMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: buildUserPrompt(safeContent, role, sectionIds) },
  ]

  let response = await requestCompletion(baseMessages, maxTokens)
  let partialContent = response.content
  let continuationCount = 0

  logDebug('response', {
    role,
    sectionIds,
    contentLength: response.content.length,
    finishReason: response.finishReason,
    usage: response.usage,
    maxTokens,
  })

  while (shouldContinue({
    content: partialContent,
    finishReason: response.finishReason,
    completionTokens: response.usage?.completion_tokens,
    maxTokens,
  }) && continuationCount < MAX_CONTINUATIONS) {
    continuationCount += 1
    const tail = tailWindow(stripEndMarker(partialContent))
    response = await requestCompletion([
      ...baseMessages,
      { role: 'assistant', content: tail },
      { role: 'user', content: buildContinuationPrompt(role, sectionIds) },
    ], maxTokens)
    partialContent = `${partialContent}\n${response.content}`

    logDebug('continuation', {
      role,
      sectionIds,
      continuationCount,
      contentLength: response.content.length,
      finishReason: response.finishReason,
      usage: response.usage,
      maxTokens,
    })
  }

  return stripEndMarker(partialContent)
}

export async function callRoleReview(role: EditorRole, systemPrompt: string, userContent: string): Promise<string> {
  const outputs = new Map<string, string>()

  for (const group of getSectionGroups(role)) {
    const content = await callGLM(systemPrompt, userContent, group.map(section => section.id), role)
    outputs.set(group[0].id, content)
  }

  return mergeSectionOutputs(role, outputs)
}

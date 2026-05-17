import { useState, useCallback } from 'react'
import type { EditorRole, ReviewState } from '../types'
import { callRoleReview } from '../services/glmApi'
import { nineGridPrompt } from '../prompts/nineGrid'
import { sourcingPrompt } from '../prompts/sourcing'
import { positioningPrompt } from '../prompts/positioning'
import { brandingPrompt } from '../prompts/branding'

const PROMPT_MAP: Record<EditorRole, string> = {
  nineGrid: nineGridPrompt,
  sourcing: sourcingPrompt,
  positioning: positioningPrompt,
  branding: brandingPrompt,
}

export function useReview() {
  const [reviews, setReviews] = useState<Record<EditorRole, ReviewState>>({
    nineGrid: { status: 'idle', content: '' },
    sourcing: { status: 'idle', content: '' },
    positioning: { status: 'idle', content: '' },
    branding: { status: 'idle', content: '' },
  })

  const startReview = useCallback(async (article: string) => {
    const roles: EditorRole[] = ['nineGrid', 'sourcing', 'positioning', 'branding']

    setReviews(prev => {
      const next = { ...prev }
      for (const role of roles) {
        next[role] = { status: 'loading', content: '' }
      }
      return next
    })

    const promises = roles.map(async (role) => {
      try {
        const content = await callRoleReview(role, PROMPT_MAP[role], article)
        setReviews(prev => ({ ...prev, [role]: { status: 'done', content } }))
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知錯誤'
        setReviews(prev => ({ ...prev, [role]: { status: 'error', content: '', error: message } }))
      }
    })

    await Promise.allSettled(promises)
  }, [])

  const reset = useCallback(() => {
    setReviews({
      nineGrid: { status: 'idle', content: '' },
      sourcing: { status: 'idle', content: '' },
      positioning: { status: 'idle', content: '' },
      branding: { status: 'idle', content: '' },
    })
  }, [])

  return { reviews, startReview, reset }
}

import { describe, expect, test, vi } from 'vitest'
import type { EditorRole } from '../types'
import {
  END_OF_PART_MARKER,
  clampMaxTokens,
  getSectionGroups,
  mergeSectionOutputs,
  shouldContinue,
  stripEndMarker,
  tailWindow,
} from './glmApi'

describe('GLM API response helpers', () => {
  test('clamps requested max tokens to provider-safe range', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(clampMaxTokens('1048576')).toBe(16384)
    expect(clampMaxTokens('10')).toBe(256)
    expect(clampMaxTokens('8192')).toBe(8192)
    expect(clampMaxTokens(undefined)).toBe(8192)
    expect(warn).toHaveBeenCalledWith(
      '[GLM] VITE_ZP_MAX_TOKENS clamped',
      { requested: 1048576, clamped: 16384 },
    )

    warn.mockRestore()
  })

  test('uses explicit end marker before finish_reason heuristics', () => {
    expect(shouldContinue({ content: `done\n${END_OF_PART_MARKER}`, finishReason: 'length' })).toBe(false)
    expect(shouldContinue({ content: 'unfinished list\n- item', finishReason: 'length' })).toBe(true)
    expect(shouldContinue({ content: 'complete but marker missing', finishReason: 'stop' })).toBe(false)
  })

  test('strips control end markers from visible output', () => {
    expect(stripEndMarker(`正文\n${END_OF_PART_MARKER}\n`)).toBe('正文')
  })

  test('keeps only the tail window for continuation context', () => {
    const content = 'A'.repeat(5000) + 'B'.repeat(2000)

    expect(tailWindow(content, 3000)).toHaveLength(3000)
    expect(tailWindow(content, 3000)).toBe(`${'A'.repeat(1000)}${'B'.repeat(2000)}`)
  })
})

describe('fixed review sections', () => {
  test('groups each editor into deterministic section chunks', () => {
    const nineGridGroups = getSectionGroups('nineGrid')
    const brandingGroups = getSectionGroups('branding')

    expect(nineGridGroups.map(group => group.map(section => section.id))).toEqual([
      ['S1', 'S2'],
      ['S3', 'S4'],
      ['S5', 'S6'],
    ])
    expect(brandingGroups.at(-1)?.map(section => section.id)).toEqual(['S7', 'S8'])
  })

  test('merges section outputs using the fixed role section order', () => {
    const outputs = new Map<string, string>([
      ['S2', 'second'],
      ['S1', 'first'],
      ['S6', 'sixth'],
    ])

    expect(mergeSectionOutputs('nineGrid' satisfies EditorRole, outputs)).toBe('first\n\nsecond\n\nsixth')
  })
})

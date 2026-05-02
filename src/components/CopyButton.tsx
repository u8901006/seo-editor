import { useState } from 'react'

interface Props {
  text: string
}

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '8px 16px',
        background: copied ? '#5a7a3a' : 'var(--accent)',
        color: '#fff7f0',
        border: 'none',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
        boxShadow: '0 2px 8px rgba(140,79,43,0.2)',
      }}
    >
      {copied ? '✅ 已複製' : '📋 複製'}
    </button>
  )
}

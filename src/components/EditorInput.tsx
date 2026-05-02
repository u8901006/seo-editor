import { useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}

export default function EditorInput({ value, onChange, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') onChange(text)
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ marginBottom: 32 }} className="animate-fade-up">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>
          📝 輸入文章
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            style={{
              padding: '6px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--accent)',
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            📁 上傳 .md
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="在這裡貼上你的 Markdown 文章，或點擊「上傳 .md」匯入檔案..."
        style={{
          width: '100%',
          minHeight: 280,
          padding: '20px 22px',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          fontSize: 14,
          lineHeight: 1.8,
          fontFamily: 'var(--font)',
          color: 'var(--text)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow)',
          resize: 'vertical',
          outline: 'none',
          transition: 'box-shadow 0.2s',
        }}
        onFocus={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      />
    </div>
  )
}

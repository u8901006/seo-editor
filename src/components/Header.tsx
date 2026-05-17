import { useState } from 'react'
import { getApiKey, setApiKey } from '../services/glmApi'

export default function Header() {
  const storedKey = getApiKey()
  const [key, setKey] = useState(storedKey)
  const [showInput, setShowInput] = useState(!storedKey)
  const [saved, setSaved] = useState(Boolean(storedKey))

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim())
      setSaved(true)
      setShowInput(false)
    }
  }

  const handleClear = () => {
    setKey('')
    setSaved(false)
    setShowInput(true)
    localStorage.removeItem('seo_editor_api_key')
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--line)',
      boxShadow: '0 2px 12px rgba(61,36,15,0.06)',
    }}>
      <div style={{
        maxWidth: 880,
        margin: '0 auto',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}></span>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)' }}>
            SEO Editor
          </h1>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>
            AI 文章審查
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saved && !showInput ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#5a7a3a',
                display: 'inline-block',
              }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>API Key 已設定</span>
              <button
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 12,
                  color: 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                重設
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="輸入智譜 AI API Key"
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  fontSize: 13,
                  width: 240,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={!key.trim()}
                style={{
                  padding: '8px 16px',
                  background: 'var(--accent)',
                  color: '#fff7f0',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: key.trim() ? 'pointer' : 'default',
                  opacity: key.trim() ? 1 : 0.5,
                }}
              >
                儲存
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

import { useState } from 'react'
import type { EditorRole } from './types'
import { EDITORS } from './types'
import { useReview } from './hooks/useReview'
import { getApiKey } from './services/glmApi'
import Header from './components/Header'
import EditorInput from './components/EditorInput'
import EditorTabs from './components/EditorTabs'
import ReviewPanel from './components/ReviewPanel'
import Footer from './components/Footer'

export default function App() {
  const [article, setArticle] = useState('')
  const [activeTab, setActiveTab] = useState<EditorRole>('nineGrid')
  const { reviews, startReview, reset } = useReview()
  const hasKey = !!getApiKey()
  const isLoading = Object.values(reviews).some(r => r.status === 'loading')

  const handleReview = async () => {
    if (!article.trim()) return
    if (!hasKey) {
      alert('請先在上方輸入 API Key')
      return
    }
    reset()
    await startReview(article.trim())
  }

  const handleReset = () => {
    setArticle('')
    reset()
  }

  const activeEditor = EDITORS.find(e => e.id === activeTab)!

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="container">
        <EditorInput
          value={article}
          onChange={setArticle}
          disabled={isLoading}
        />

        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
        }}>
          <button
            onClick={handleReview}
            disabled={!article.trim() || isLoading || !hasKey}
            style={{
              padding: '12px 32px',
              background: (!article.trim() || !hasKey) ? 'var(--line)' : 'var(--accent)',
              color: '#fff7f0',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 15,
              fontWeight: 700,
              cursor: (!article.trim() || isLoading || !hasKey) ? 'default' : 'pointer',
              opacity: (!article.trim() || isLoading || !hasKey) ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(140,79,43,0.2)',
            }}
          >
            {isLoading ? '審查中...' : '▶ 開始審查'}
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            style={{
              padding: '12px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              color: 'var(--muted)',
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            清除重來
          </button>
        </div>

        <div className="animate-fade-up" style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>
          <EditorTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            reviews={reviews}
          />

          <div style={{ position: 'relative' }}>
            <div style={{
              padding: '8px 26px 4px',
              fontSize: 12,
              color: 'var(--muted)',
              borderBottom: '1px solid var(--line)',
            }}>
              {activeEditor.icon} {activeEditor.description}
            </div>
            <ReviewPanel review={reviews[activeTab]} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

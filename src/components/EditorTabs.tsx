import type { EditorRole, EditorConfig, ReviewState } from '../types'
import { EDITORS } from '../types'

interface Props {
  activeTab: EditorRole
  onTabChange: (role: EditorRole) => void
  reviews: Record<EditorRole, ReviewState>
}

const STATUS_MAP: Record<ReviewState['status'], { label: string; color: string }> = {
  idle: { label: '', color: 'var(--line)' },
  loading: { label: '⏳', color: '#9f7a2e' },
  done: { label: '✅', color: '#5a7a3a' },
  error: { label: '❌', color: '#a63d2f' },
}

export default function EditorTabs({ activeTab, onTabChange, reviews }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 0,
      borderBottom: '2px solid var(--line)',
      marginBottom: 0,
      overflowX: 'auto',
    }}>
      {EDITORS.map((editor: EditorConfig) => {
        const review = reviews[editor.id]
        const status = STATUS_MAP[review.status]
        const isActive = activeTab === editor.id

        return (
          <button
            key={editor.id}
            onClick={() => onTabChange(editor.id)}
            style={{
              padding: '12px 20px',
              background: isActive ? 'var(--surface)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              position: 'relative',
              top: 2,
            }}
          >
            <span>{status.label}</span>
            <span>{editor.name}</span>
          </button>
        )
      })}
    </div>
  )
}

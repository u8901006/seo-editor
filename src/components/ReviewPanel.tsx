import ReactMarkdown from 'react-markdown'
import CopyButton from './CopyButton'
import type { ReviewState } from '../types'

interface Props {
  review: ReviewState
}

export default function ReviewPanel({ review }: Props) {
  if (review.status === 'idle') {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 15,
      }}>
        輸入文章後點擊「開始審查」，這裡會顯示審查結果
      </div>
    )
  }

  if (review.status === 'loading') {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 15,
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid var(--line)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        正在審查中，請稍候...
      </div>
    )
  }

  if (review.status === 'error') {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#a63d2f',
        fontSize: 14,
        background: 'rgba(166,61,47,0.06)',
        borderRadius: 'var(--radius-sm)',
        margin: 20,
      }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>審查失敗</p>
        <p>{review.error}</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 5,
      }}>
        <CopyButton text={review.content} />
      </div>
      <div style={{
        padding: '28px 26px',
        fontSize: 14,
        lineHeight: 1.85,
        overflowY: 'auto',
        maxHeight: '60vh',
      }}>
        <ReactMarkdown>{review.content}</ReactMarkdown>
      </div>
    </div>
  )
}

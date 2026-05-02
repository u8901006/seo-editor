export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      padding: '20px 32px',
      textAlign: 'center',
      color: 'var(--muted)',
      fontSize: 12,
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 880,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span>SEO Editor — AI 文章審查工具</span>
        <a
          href="https://github.com/u8901006/seo-editor"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}

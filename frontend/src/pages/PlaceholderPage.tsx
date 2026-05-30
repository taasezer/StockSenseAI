const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div>
      <h2 className="page-title">{title}</h2>
      <p className="page-subtitle">Module under construction</p>

      <div className="stat-card" style={{ marginTop: '32px', textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ marginBottom: '16px', color: 'var(--brand-red)' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
        </div>
        <h3 style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            The {title} module is currently offline
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
            Our engineers are working on establishing the neural links for this sector. Please check back later.
        </p>
      </div>
    </div>
  )
}

export default PlaceholderPage

export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{
      background: 'var(--bg-app)', border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line"
          style={{
            height: i === 0 ? '20px' : '14px',
            width: i === 0 ? '60%' : i === lines - 1 ? '40%' : '80%',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonProductRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-md)', background: 'var(--bg-app)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="skeleton-line" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="skeleton-line" style={{ width: '120px', height: '14px' }} />
          <div className="skeleton-line" style={{ width: '80px', height: '12px' }} />
        </div>
      </div>
      <div className="skeleton-line" style={{ width: '50px', height: '14px' }} />
    </div>
  );
}

export function SkeletonAdminCard() {
  return (
    <div style={{
      border: '1px solid var(--border)', padding: '16px',
      borderRadius: 'var(--radius-md)', background: 'var(--bg-app)',
      display: 'flex', flexDirection: 'column', gap: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton-line" style={{ width: '120px', height: '16px' }} />
        <div className="skeleton-line" style={{ width: '100px', height: '14px' }} />
      </div>
      <div className="skeleton-line" style={{ width: '100%', height: '14px' }} />
      <div className="skeleton-line" style={{ width: '70%', height: '14px' }} />
    </div>
  );
}

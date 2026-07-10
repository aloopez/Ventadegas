const STEPS = [
  { num: 1, label: 'Cilindro' },
  { num: 2, label: 'Zona' },
  { num: 3, label: 'Datos' },
  { num: 4, label: 'Resumen' },
];

export default function ProgressBar({ currentStep }) {
  const totalSteps = STEPS.length;
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div style={{ padding: '16px 1rem 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        {STEPS.map((s, i) => {
          const isActive = currentStep >= s.num;
          const isCurrent = currentStep === s.num;
          return (
            <div key={s.num} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', fontWeight: isCurrent ? '700' : '500',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              color: isActive ? 'var(--primary)' : 'var(--text-hint)',
              transition: 'color 0.2s ease'
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: isActive ? 'var(--primary)' : 'var(--border)',
                color: '#fff', fontSize: '10px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.3s ease'
              }}>{s.num}</div>
              {s.label}
              {i < totalSteps - 1 && (
                <div style={{
                  width: `${100 / (totalSteps - 1)}%`, maxWidth: '40px',
                  height: '2px', background: isActive ? 'var(--primary)' : 'var(--border)',
                  marginLeft: '6px', borderRadius: '1px',
                  transition: 'background 0.3s ease'
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

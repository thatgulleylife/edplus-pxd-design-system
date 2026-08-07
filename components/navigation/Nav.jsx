export function Nav({ brand = 'EdPlus · Product & Experience Design', links = [], backHref, backLabel }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 30,
      backdropFilter: 'saturate(180%) blur(18px)',
      background: 'rgba(255,255,255,.82)',
      borderBottom: '1px solid #ececef',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '16px 56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span style={{
            width: '11px', height: '11px', borderRadius: '50%', background: '#b01e54',
            boxShadow: '0 0 0 4px rgba(176,30,84,.12)', flexShrink: 0, display: 'inline-block',
          }} />
          {brand}
        </div>

        {backHref && (
          <a href={backHref} style={{ fontSize: '15px', color: '#b01e54', fontWeight: 500, textDecoration: 'none' }}>
            ← {backLabel || 'Back'}
          </a>
        )}

        {links.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {links.map((l, i) => (
              <a key={i} href={l.href} style={{
                fontSize: '14.5px', fontWeight: 600,
                color: l.active ? '#b01e54' : '#3a3a3c',
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '5px',
              }}>{l.label}{l.external && ' ↗'}</a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

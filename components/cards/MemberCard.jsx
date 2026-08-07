export function MemberCard({ name, title, avatar, manages }) {
  const initials = name
    ? name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';
  const [err, setErr] = React.useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '18px',
      border: '1px solid #d7d7dd', borderRadius: '16px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(140,29,64,.05)',
    }}>
      {/* avatar */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
        overflow: 'hidden', display: 'grid', placeItems: 'center',
        background: 'linear-gradient(135deg, #c9285f, #7c1438)',
      }}>
        {avatar && !err
          ? <img src={avatar} alt={name} onError={() => setErr(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }} />
          : <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.01em' }}>{initials}</span>
        }
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: '13.5px', color: '#7d7d85', marginTop: '2px', lineHeight: 1.35 }}>{title}</div>
        {manages != null && manages > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '9px', padding: '4px 12px 4px 10px',
            borderRadius: '999px', background: '#fbe7ee',
            color: '#b01e54', fontSize: '13px', fontWeight: 600, lineHeight: 1,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="17" cy="7" r="3"/><path d="M10 20v-3a7 7 0 0 1 14 0v3"/><circle cx="7" cy="11" r="4"/><path d="M1 20v-2a5 5 0 0 1 9.9-1"/>
            </svg>
            Manages <b>{manages}</b>
          </div>
        )}
      </div>
    </div>
  );
}

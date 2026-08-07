export function LeaderCard({ name, team, role, count, photo, href }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href || '#'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'block',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#f5f5f7',
        border: '1px solid #ececef',
        transform: hovered ? 'translateY(-8px)' : 'none',
        boxShadow: hovered ? '0 20px 60px rgba(140,29,64,.18)' : '0 10px 40px rgba(0,0,0,.08)',
        transition: 'transform 0.45s cubic-bezier(0.2,0.7,0.2,1), box-shadow 0.45s ease',
        minHeight: '360px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* photo */}
      <div style={{
        height: '260px', width: '100%', overflow: 'hidden',
        background: 'linear-gradient(135deg, #d9b3c2, #7c1438)',
      }}>
        {photo && (
          <img src={photo} alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }} />
        )}
      </div>

      {/* headcount badge */}
      {count != null && (
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)',
          color: '#b01e54', fontWeight: 650, fontSize: '13px',
          padding: '6px 12px', borderRadius: '999px',
          boxShadow: '0 4px 14px rgba(0,0,0,.12)',
        }}>{count} people</div>
      )}

      {/* body */}
      <div style={{ padding: '22px 24px 26px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#b01e54' }}>{team}</div>
        <div style={{ fontSize: '23px', letterSpacing: '-0.02em', margin: '8px 0 4px', fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: '15px', color: '#7d7d85' }}>{role}</div>
        <div style={{
          marginTop: '16px', fontSize: '14px', fontWeight: 600, color: '#b01e54',
          letterSpacing: hovered ? '0.03em' : '0',
          transition: 'letter-spacing 0.25s ease',
        }}>View profile →</div>
      </div>
    </a>
  );
}

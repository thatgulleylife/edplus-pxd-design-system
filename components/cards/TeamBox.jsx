export function TeamBox({ team, leader, role, count, icon, sentence, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        border: '1px solid #ececef',
        borderRadius: '20px',
        padding: '24px 22px 22px',
        minHeight: '224px',
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        width: '100%',
        transform: hovered ? 'translateY(-12px) rotate(-2.5deg)' : 'none',
        boxShadow: hovered ? '0 38px 64px -26px rgba(20,20,30,.44)' : 'none',
        borderColor: hovered ? '#e2e2e6' : '#ececef',
        transition: 'transform 0.4s cubic-bezier(.34,1.4,.5,1), box-shadow 0.35s, border-color 0.35s',
      }}
    >
      {/* blob */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #fbeef3, transparent 70%)',
        transform: hovered ? 'scale(1.45)' : 'scale(.5)',
        opacity: hovered ? 1 : 0,
        transition: 'transform 0.55s cubic-bezier(.2,.8,.2,1), opacity 0.55s',
        pointerEvents: 'none',
      }} />

      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: '#fbeef3', color: '#b01e54',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          transform: hovered ? 'scale(1.1) rotate(-6deg)' : 'none',
          transition: 'transform 0.4s cubic-bezier(.2,1.5,.4,1)',
        }}>
          {icon && <span style={{ display: 'flex', width: '25px', height: '25px' }} dangerouslySetInnerHTML={{ __html: icon }} />}
        </div>
        {count != null && (
          <span style={{
            fontSize: '12px', fontWeight: 800, color: '#b01e54',
            background: '#fbeef3', borderRadius: '999px',
            padding: '5px 11px', whiteSpace: 'nowrap',
          }}>{count} people</span>
        )}
      </div>

      {/* team name */}
      <div style={{
        fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em',
        color: '#1a1a1c', marginTop: '22px', lineHeight: 1.06,
        overflowWrap: 'break-word', hyphens: 'auto',
      }}>{team}</div>

      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#3a3a3c', marginTop: '12px', lineHeight: 1.2 }}>{leader}</div>
      <div style={{ fontSize: '13px', color: '#7d7d85', marginTop: '4px', lineHeight: 1.36 }}>{role}</div>

      {/* CTA */}
      <div style={{
        marginTop: 'auto', paddingTop: '16px',
        fontSize: '13px', fontWeight: 700, color: '#b01e54',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'none' : 'translateX(-5px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        display: 'inline-flex', gap: '6px',
      }}>
        Meet {leader?.split(' ')[0]} →
      </div>
    </button>
  );
}

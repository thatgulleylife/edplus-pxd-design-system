export function Avatar({ src, name, size = 56, ring = false, ringColor = '#b01e54' }) {
  const initials = name
    ? name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  const [err, setErr] = React.useState(false);

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #c9285f, #7c1438)',
    boxShadow: ring ? `0 0 0 3px #fff, 0 0 0 5px ${ringColor}` : '0 16px 30px -14px rgba(20,20,30,.42)',
    position: 'relative',
  };

  if (src && !err) {
    return (
      <div style={style}>
        <img
          src={src}
          alt={name || ''}
          onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 24%', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div style={style}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: size * 0.32, letterSpacing: '-0.01em' }}>{initials}</span>
    </div>
  );
}

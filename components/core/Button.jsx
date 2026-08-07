export function Button({ children, variant = 'primary', href, onClick, disabled, icon }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '9px',
    fontSize: '15.5px',
    fontWeight: 650,
    padding: '14px 24px',
    borderRadius: '999px',
    cursor: disabled ? 'default' : 'pointer',
    border: '1px solid transparent',
    textDecoration: 'none',
    fontFamily: 'inherit',
    transition: 'transform 0.18s ease, box-shadow 0.28s ease, background 0.25s ease, border-color 0.25s ease',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    willChange: 'transform',
    lineHeight: 1,
  };

  const variants = {
    primary: {
      background: '#1a1a1c',
      color: '#fff',
      boxShadow: '0 14px 30px -16px rgba(20,20,30,.6)',
    },
    maroon: {
      background: 'linear-gradient(135deg, #c9285f, #7c1438)',
      color: '#fff',
      boxShadow: '0 14px 30px -16px rgba(124,20,56,.5)',
    },
    ghost: {
      background: 'transparent',
      color: '#b01e54',
      border: '1.5px solid rgba(176,30,84,.42)',
    },
    soft: {
      background: '#fbeef3',
      color: '#b01e54',
      border: '1px solid rgba(176,30,84,.18)',
    },
  };

  const style = { ...base, ...variants[variant] };

  const [hovered, setHovered] = React.useState(false);
  const hoverStyles = {
    primary: { boxShadow: '0 20px 40px -16px rgba(176,30,84,.5)' },
    maroon:  { boxShadow: '0 20px 40px -16px rgba(124,20,56,.7)' },
    ghost:   { background: 'rgba(176,30,84,.06)', borderColor: '#b01e54', transform: 'translateY(-1px)' },
    soft:    { background: '#f4c7d5' },
  };
  if (hovered) Object.assign(style, hoverStyles[variant] || {});

  const props = {
    style,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick,
    disabled,
  };

  const content = (
    <>
      {children}
      {icon && <span style={{ transition: 'transform 0.3s cubic-bezier(.2,.8,.2,1)', transform: hovered ? 'translateX(4px)' : 'none' }}>{icon}</span>}
    </>
  );

  if (href) return <a href={href} {...props}>{content}</a>;
  return <button type="button" {...props}>{content}</button>;
}

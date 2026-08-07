export function Pill({ children, variant = 'default', size = 'md' }) {
  const sizes = {
    sm: { fontSize: '11px', padding: '4px 10px' },
    md: { fontSize: '13px', padding: '7px 14px' },
    lg: { fontSize: '14px', padding: '9px 18px' },
  };

  const variants = {
    default: { background: '#f5f5f7', color: '#3a3a3c', border: '1px solid #ececef' },
    accent:  { background: '#fbeef3', color: '#b01e54', border: '1px solid rgba(176,30,84,.18)' },
    maroon:  { background: '#b01e54', color: '#fff', border: 'none' },
    gold:    { background: 'linear-gradient(120deg,#fdf3cf,#ffe9a8)', color: '#6b4e00', border: '1px solid #f1d488' },
    dark:    { background: '#1a1a1c', color: '#fff', border: 'none' },
    team:    { background: '#fbeef3', color: '#b01e54', fontWeight: 800, border: 'none', fontVariantNumeric: 'tabular-nums' },
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      borderRadius: '999px',
      fontWeight: 600,
      lineHeight: 1,
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      ...sizes[size],
      ...variants[variant],
    }}>
      {children}
    </span>
  );
}

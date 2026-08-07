export function Eyebrow({ children, withLine = true }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: '#b01e54',
      fontFamily: 'inherit',
    }}>
      {withLine && (
        <span style={{ width: '22px', height: '2px', background: '#b01e54', borderRadius: '2px', display: 'inline-block', flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}

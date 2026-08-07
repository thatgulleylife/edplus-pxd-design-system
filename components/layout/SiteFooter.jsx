/**
 * SiteFooter — the shared page footer.
 *
 * Source geometry (index.html `.foot.wrap` / `.foot-in`):
 *   .foot      border-top 1px --line · margin-top 96px (64px ≤600px) · padding 40px 0 56px
 *   .wrap      max-width 1280px · margin 0 auto · padding 0 56px (24px ≤680px)
 *   .foot-in   flex · align-items flex-start · justify-content space-between · gap 30px · wrap
 *   .brand     flex · gap 11px · 15px/600 · letter-spacing -0.01em
 *   .brand .dot 11×11 circle, --accent, `pulse 2.6s ease-out infinite` halo
 *   .fcopy     13.5px · --muted · line-height 1.6 · max-width 520px · margin-top 14px
 *   .flinks    flex · gap 26px · wrap;  a → 14px/600 · --ink-2 · hover --accent (.2s)
 *
 * The `pulse` keyframe is the shared one in motion/keyframes.css.
 */

/** Subscribe to a media query without any external dependency. */
function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

export function SiteFooter({
  brand = 'Organization Name, Department',
  copy = 'Last updated YYYY.',
  links = [
    { label: 'Section One', href: '#' },
    { label: 'Section Two', href: '#' },
  ],
  showDot = true,
  animateDot = true,
  maxWidth = 'var(--maxw, 1280px)',
  linksLabel = 'Footer',
  style,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(-1);

  // .wrap flips its horizontal padding at 680px; .foot drops its top margin at 600px.
  const isNarrow = useMediaQuery('(max-width: 680px)');
  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <footer
      {...rest}
      style={{
        borderTop: '1px solid var(--line, #ececef)',
        paddingTop: 'var(--space-10, 40px)',
        paddingBottom: 'var(--space-14, 56px)',
        paddingLeft: isNarrow ? 'var(--wrap-pad-sm, 24px)' : 'var(--wrap-pad, 56px)',
        paddingRight: isNarrow ? 'var(--wrap-pad-sm, 24px)' : 'var(--wrap-pad, 56px)',
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 0,
        marginTop: isMobile ? 'var(--space-16, 64px)' : 'var(--section-gap, 96px)',
        boxSizing: 'border-box',
        fontFamily: 'var(--font, var(--font-sans))',
        color: 'var(--ink, #1a1a1c)',
        ...style,
      }}
    >
      {/* .foot-in */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '30px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          {/* .brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              fontSize: '15px',
              fontWeight: 'var(--fw-semibold, 600)',
              letterSpacing: '-0.01em',
            }}
          >
            {showDot && (
              <span
                aria-hidden="true"
                style={{
                  width: '11px',
                  height: '11px',
                  flexShrink: 0,
                  display: 'inline-block',
                  borderRadius: 'var(--radius-circle, 50%)',
                  background: 'var(--accent, #b01e54)',
                  boxShadow: '0 0 0 0 rgba(176,30,84,.5)',
                  animation: animateDot ? 'pulse 2.6s ease-out infinite' : 'none',
                }}
              />
            )}
            {brand}
          </div>

          {/* .fcopy */}
          {copy && (
            <p
              style={{
                fontSize: '13.5px',
                color: 'var(--muted, #7d7d85)',
                lineHeight: 'var(--lh-relaxed, 1.6)',
                maxWidth: '520px',
                margin: '14px 0 0',
              }}
            >
              {copy}
            </p>
          )}
        </div>

        {/* .flinks */}
        {links.length > 0 && (
          <nav
            aria-label={linksLabel}
            style={{ display: 'flex', gap: '26px', flexWrap: 'wrap' }}
          >
            {links.map((link, i) => (
              <a
                key={`${link.href}-${i}`}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noreferrer noopener' } : null)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(-1)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(-1)}
                style={{
                  fontSize: 'var(--text-sm, 14px)',
                  fontWeight: 'var(--fw-semibold, 600)',
                  color: hovered === i ? 'var(--accent, #b01e54)' : 'var(--ink-2, #3a3a3c)',
                  textDecoration: 'none',
                  transition: 'color var(--dur-fast, 200ms) var(--ease-out, ease)',
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}

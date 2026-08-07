/**
 * LeaderContext — the "context block" section from the leader microsite page.
 *
 * Ports `leader.html > section#contextSection.ctx`, whose DOM only exists at
 * runtime: an inline script renders it from a per-leader data object, so the
 * structure below mirrors that generated markup exactly —
 *
 *   section.ctx
 *     div.ctx-wrap            gradient panel, 28px radius, deep inset padding
 *       div.seyebrow          accent eyebrow with a leading 28×2 rule
 *       h2                    clamp(26px, 3vw, 38px), extrabold
 *       div.ctx-cards         stacked white cards, 16px gap
 *         div.ctx-card        icon well + title/badge head + body copy
 *       div.ctx-cta           centered outline pill (anchor or button)
 *
 * Motion: every direct child of the panel is a `.sreveal` element — it starts at
 * `opacity:0; translateY(34px)` and settles once the section scrolls into view
 * (IntersectionObserver, trigger line pulled up 15% from the viewport bottom),
 * staggered 0s / .08s / .16s + .08s per card / .32s. `prefers-reduced-motion`
 * and `animate={false}` both render the settled state immediately.
 *
 * Body copy supports `**bold**`, matching the source's markdown-lite pass.
 */

const CTX_ICONS = {
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-12" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

/* Tone → icon-well and badge colors. `rose` is the brand accent; `green` and
   `risk` map onto the nearest semantic tokens, with the source literals kept as
   fallbacks so the component still renders correctly without the token sheet. */
const CTX_TONES = {
  rose: { bg: 'var(--accent-soft, #fbeef3)', fg: 'var(--accent, #b01e54)' },
  green: { bg: 'var(--color-green-soft, #dcf3e4)', fg: 'var(--color-green-ink, #2e9e5b)' },
  risk: { bg: 'var(--color-gold-soft, #fdecd2)', fg: 'var(--color-gold-ink, #c2760a)' },
};

const FALLBACK_HEADING_ID = () => 'leader-context-heading';

/** `**bold**` → <b>, matching the source's regex pass over the card body. */
function renderBody(text) {
  return String(text)
    .split(/\*\*(.+?)\*\*/g)
    .map((chunk, i) =>
      i % 2 === 1 ? (
        <b key={i} style={{ color: 'var(--ink)', fontWeight: 'var(--fw-bold)' }}>
          {chunk}
        </b>
      ) : (
        chunk
      )
    );
}

export function LeaderContext({
  eyebrow = 'Section eyebrow',
  title = 'Section headline goes here',
  cards = [
    {
      icon: 'data',
      tone: 'rose',
      title: 'Card title goes here',
      badge: '0 → 0',
      body:
        'Supporting detail for this card. Use double asterisks to emphasise a ' +
        '**key phrase** inside the sentence.',
    },
    {
      icon: 'warn',
      tone: 'risk',
      title: 'Second card title',
      badge: 'Status label',
      body:
        'A second line of supporting detail. Keep each card to one short ' +
        'paragraph so the stack stays scannable.',
    },
  ],
  cta = { label: 'Call to action' },
  animate = true,
  headingId,
}) {
  const sectionRef = React.useRef(null);
  const [shown, setShown] = React.useState(!animate);
  /* React.useId when available (18+), otherwise a stable literal fallback. */
  const autoId = (React.useId || FALLBACK_HEADING_ID)();
  const h2Id = headingId || autoId;

  React.useEffect(() => {
    if (!animate) {
      setShown(true);
      return undefined;
    }
    const el = sectionRef.current;
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }
    /* Trigger line pulled up 15% from the viewport bottom so the panel animates
       once it is comfortably on screen — same rootMargin as the source page. */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px -15% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);

  const reveal = (delay) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translateY(34px)',
    transition: 'opacity 1s ease, transform 1.15s var(--ease-spring)',
    transitionDelay: `${delay}s`,
    willChange: 'opacity, transform',
  });

  const ctaLabel = cta && cta.label;
  const ctaInner = (
    <>
      {ctaLabel} <span aria-hidden="true">&rarr;</span>
    </>
  );
  const ctaStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--fw-bold)',
    fontFamily: 'inherit',
    color: 'var(--accent)',
    background: 'transparent',
    border: '1.5px solid rgba(140,29,64,.45)',
    borderRadius: 'var(--radius-pill)',
    padding: '11px 22px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition:
      'background var(--dur-normal), border-color var(--dur-normal), transform var(--dur-normal)',
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby={h2Id}
      style={{ padding: 'var(--space-8) 0 var(--space-24)' }}
    >
      {/* Media query + hover state that inline styles cannot express. */}
      <style>{`
        @media (max-width: 620px) {
          .ds-ctx-card { flex-direction: column !important; gap: 14px !important; }
        }
        .ds-ctx-btn:hover {
          background: rgba(140,29,64,.06);
          border-color: var(--accent);
          transform: translateY(-1px);
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          padding: '96px clamp(52px, 8vw, 112px) 88px',
          background: [
            'radial-gradient(100% 120% at 10% 4%, rgba(255,255,255,.7), transparent 46%)',
            'radial-gradient(95% 130% at 92% 106%, rgba(176,30,84,.12), transparent 56%)',
            'radial-gradient(70% 90% at 72% 40%, rgba(233,181,58,.08), transparent 60%)',
            'linear-gradient(142deg, #fef7fa 0%, #fbeef2 46%, #f4dbe6 100%)',
          ].join(', '),
          border: '1px solid rgba(176,30,84,.14)',
          boxShadow: '0 30px 60px -34px rgba(124,20,56,.32)',
        }}
      >
        {/* Eyebrow — the leading rule is the source's ::before pseudo-element. */}
        <div
          style={{
            ...reveal(0),
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            margin: '0 0 14px',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-caps)',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 28,
              height: 2,
              background: 'var(--accent)',
              borderRadius: 2,
              display: 'inline-block',
            }}
          />
          {eyebrow}
        </div>

        <h2
          id={h2Id}
          style={{
            ...reveal(0.08),
            fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 'var(--fw-extrabold)',
            letterSpacing: 'var(--ls-tighter)',
            color: 'var(--ink)',
            margin: '0 0 30px',
          }}
        >
          {title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cards.map((card, i) => {
            const tone = CTX_TONES[card.tone] ? card.tone : 'rose';
            const swatch = CTX_TONES[tone];
            return (
              <div
                key={i}
                className="ds-ctx-card"
                style={{
                  ...reveal(0.16 + i * 0.08),
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                  background: 'var(--bg, #fff)',
                  /* 18px sits between --radius-md (14) and --radius-lg (20); no
                     token matches, so the source literal is kept. */
                  borderRadius: 18,
                  padding: '22px 24px',
                  boxShadow: '0 14px 32px -26px rgba(72,20,40,.45)',
                }}
              >
                <div
                  style={{
                    flex: '0 0 auto',
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    display: 'grid',
                    placeItems: 'center',
                    background: swatch.bg,
                    color: swatch.fg,
                  }}
                >
                  <span style={{ display: 'grid', width: 24, height: 24 }}>
                    {CTX_ICONS[card.icon] || CTX_ICONS.data}
                  </span>
                </div>

                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 9,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 21,
                        fontWeight: 'var(--fw-bold)',
                        letterSpacing: 'var(--ls-tight)',
                        lineHeight: 1.12,
                        color: 'var(--ink)',
                      }}
                    >
                      {card.title}
                    </span>
                    {card.badge && (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 'var(--fw-extrabold)',
                          letterSpacing: 'var(--ls-wide)',
                          padding: '4px 11px',
                          borderRadius: 'var(--radius-pill)',
                          whiteSpace: 'nowrap',
                          background: swatch.bg,
                          color: swatch.fg,
                        }}
                      >
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--lh-normal)',
                      color: 'var(--muted)',
                      margin: 0,
                    }}
                  >
                    {renderBody(card.body || '')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {ctaLabel && (
          <div
            style={{
              ...reveal(0.32),
              display: 'flex',
              justifyContent: 'center',
              marginTop: 32,
            }}
          >
            {cta.href ? (
              <a
                className="ds-ctx-btn"
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                style={ctaStyle}
              >
                {ctaInner}
              </a>
            ) : (
              <button className="ds-ctx-btn" type="button" onClick={cta.onClick} style={ctaStyle}>
                {ctaInner}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

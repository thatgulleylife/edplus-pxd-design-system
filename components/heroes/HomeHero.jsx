/**
 * HomeHero — the homepage hero from the live microsite.
 *
 * Structure mirrors `index.html > section.hero`: a two-column grid with the
 * text column on the left and the fanning three-card stage on the right.
 * The headline stacks one word per line; the final line is the accent anchor
 * and each line masks in from below.
 *
 * Motion comes from the shared library (motion/keyframes.css):
 * pf-fanLeft / pf-fanCenter / pf-fanRight for the card stage, pf-floatY for
 * the ambient drift. Both honor prefers-reduced-motion.
 */
export function HomeHero({
  eyebrow = 'EdPlus at ASU · ASU Online',
  lines = ['Product &', 'Experience', 'Design'],
  lead,
  ctaLabel = 'Meet the teams',
  ctaHref = '#',
  cards = [],
}) {
  // Last line is the accent anchor, per the brand's headline pattern.
  const lastIndex = lines.length - 1;

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1.02fr .98fr',
        gap: 48,
        alignItems: 'center',
        padding: '48px 0',
      }}
    >
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 'var(--ls-caps)',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}
        >
          <span
            style={{
              width: 26,
              height: 2,
              background: 'var(--accent)',
              borderRadius: 2,
              display: 'inline-block',
            }}
          />
          {eyebrow}
        </span>

        <h1
          style={{
            margin: '20px 0 0',
            fontWeight: 'var(--fw-extrabold)',
            letterSpacing: 'var(--ls-tightest)',
            lineHeight: 0.94,
            fontSize: 'clamp(46px, 6.6vw, 96px)',
            color: 'var(--ink)',
          }}
        >
          {lines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
              <span style={{ color: i === lastIndex ? 'var(--accent)' : 'inherit' }}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        {lead && (
          <p
            style={{
              fontSize: 19,
              lineHeight: 'var(--lh-relaxed)',
              color: 'var(--muted)',
              maxWidth: 480,
              margin: '26px 0 0',
              textWrap: 'pretty',
            }}
          >
            {lead}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36 }}>
          <a
            href={ctaHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 15.5,
              fontWeight: 650,
              padding: '14px 24px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--ink)',
              color: '#fff',
              textDecoration: 'none',
              boxShadow: '0 14px 30px -16px rgba(20,20,30,.6)',
              transition: 'var(--transition-fast)',
            }}
          >
            {ctaLabel} <span>↓</span>
          </a>
        </div>
      </div>

      {/* Fanning card stage — left and right cards splay out behind the center. */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 340,
          position: 'relative',
        }}
      >
        {cards.slice(0, 3).map((card, i) => {
          const anim = ['pf-fanLeft', 'pf-fanCenter', 'pf-fanRight'][i];
          const offset = [-132, 0, 132][i];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `calc(50% + ${offset}px)`,
                transform: 'translateX(-50%)',
                width: 190,
                height: 250,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: card.bg || 'var(--bg-soft)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-md)',
                animation: `${anim} 9s var(--ease-spring) infinite`,
                zIndex: i === 1 ? 2 : 1,
              }}
            >
              {card.img && (
                <img
                  src={card.img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

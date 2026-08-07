/**
 * MissionBlock — the layered radial-gradient warm quote card.
 *
 * Ported from `index.html > section.mission.wrap` (+ `.mission-in` styles and the
 * `buildQuote()` / `revealOnScroll()` pair in home.js).
 *
 * Geometry (desktop):
 *   section  — max-width 1280 (var(--maxw)), 56px side padding, 104px top margin
 *   card     — 72px / 64px padding, 30px radius (var(--radius-3xl)), overflow hidden
 *   surface  — FOUR stacked layers, painted back-to-front:
 *                1. white bloom      radial 100% 120% at 10%  4%
 *                2. accent wash      radial  95% 130% at 92% 106%
 *                3. gold warmth      radial  70%  90% at 72%  40%
 *                4. base wash        linear 142deg blush → maroon-soft → deep blush
 *   qmark    — 200px Georgia open-quote bled off the top-left, 16% accent
 *   sheen    — oversized white radial (78% × 210%) hung off the top-right
 *
 * Motion — two independent scroll reveals, exactly as the source wires them:
 *   1. `.sreveal` on the card: opacity 0 → 1, translateY(34px) → 0
 *      (opacity 1s ease, transform 1.15s var(--ease-spring)).
 *   2. A GSAP-SplitText-style word rise on the quote: every word sits in its own
 *      overflow-hidden mask and slides up from translateY(115%), staggered 42ms
 *      per word, transform .9s var(--ease-spring). The mask carries
 *      padding 0 .03em .16em / margin 0 -.03em -.16em so descenders (g, y, p)
 *      are not clipped.
 *
 * Both use the source's IntersectionObserver contract: enter at
 * rootMargin '0px 0px -15% 0px', and reset (so the reveal replays) only once the
 * element has dropped fully below the true viewport bottom. Scrolling past the
 * top never re-animates. prefers-reduced-motion short-circuits to the rested state.
 *
 * No named keyframes are needed — the whole section is transition-driven.
 */
export function MissionBlock({
  quote = 'Section headline goes here — a short statement of purpose with a few highlighted phrases that carry the weight of the idea.',
  highlights = ['highlighted', 'phrases'],
  attributionName = 'Full Name',
  attributionRole = 'Role or Title',
  avatarInitials = 'FN',
  avatarSrc,
  quoteMark = '“',
  showSheen = true,
  animate = true,
  wordStagger = 42,
  id,
  className = '',
  style,
}) {
  const cardRef = React.useRef(null);
  const quoteRef = React.useRef(null);
  const [cardIn, setCardIn] = React.useState(!animate);
  const [quoteIn, setQuoteIn] = React.useState(!animate);

  React.useEffect(() => {
    if (!animate) {
      setCardIn(true);
      setQuoteIn(true);
      return undefined;
    }
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || typeof IntersectionObserver === 'undefined') {
      setCardIn(true);
      setQuoteIn(true);
      return undefined;
    }

    const targets = [
      [cardRef.current, setCardIn],
      [quoteRef.current, setQuoteIn],
    ].filter((pair) => pair[0]);

    // Enter: trigger line pulled up 15% so the card animates once comfortably on screen.
    const ioIn = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const hit = targets.find((t) => t[0] === e.target);
          if (hit) hit[1](true);
        });
      },
      { threshold: [0], rootMargin: '0px 0px -15% 0px' }
    );

    // Reset: only once the element is fully BELOW the true viewport bottom, so the
    // reset itself is never visible. Uses no rootMargin, per the source.
    const ioReset = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) return;
          const rb = e.rootBounds || { bottom: window.innerHeight };
          if (e.boundingClientRect.top >= rb.bottom - 1) {
            const hit = targets.find((t) => t[0] === e.target);
            if (hit) hit[1](false);
          }
        });
      },
      { threshold: 0 }
    );

    targets.forEach((t) => {
      ioIn.observe(t[0]);
      ioReset.observe(t[0]);
    });
    return () => {
      ioIn.disconnect();
      ioReset.disconnect();
    };
  }, [animate, quote]);

  // Split the quote into masked words, preserving the accent-colored highlights.
  // A word matches a highlight either verbatim or with its trailing/leading
  // punctuation stripped, so "clarity," matches the highlight "clarity".
  const strip = (w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();
  const hlSet = new Set((highlights || []).map(strip).filter(Boolean));
  const words = String(quote || '').trim().split(/\s+/).filter(Boolean);

  const accentBorder = 'color-mix(in srgb, var(--accent) 14%, transparent)';

  return (
    <section
      id={id}
      className={['edp-mission', className].filter(Boolean).join(' ')}
      aria-label="Mission statement"
      style={{
        maxWidth: 'var(--maxw)',
        margin: '104px auto 0',
        padding: '0 var(--wrap-pad)',
        fontFamily: 'var(--font)',
        ...style,
      }}
    >
      <style>{`
        .edp-mission .edp-mission-in{ padding:72px 64px; }
        @media (max-width:680px){
          .edp-mission .edp-mission-in{ padding:48px 30px; }
        }
        @media (max-width:600px){
          .edp-mission{ margin-top:64px !important; padding:0 var(--wrap-pad-sm) !important; }
          .edp-mission .edp-mission-in{ padding:44px 26px; border-radius:var(--radius-xl); }
        }
        @media (prefers-reduced-motion:reduce){
          .edp-mission .edp-mission-in,
          .edp-mission .edp-mission-word > span{
            opacity:1 !important; transform:none !important; transition:none !important;
          }
        }
      `}</style>

      <div
        ref={cardRef}
        className="edp-mission-in"
        style={{
          position: 'relative',
          overflow: 'hidden',
          color: 'var(--ink)',
          borderRadius: 'var(--radius-3xl)',
          border: `1px solid ${accentBorder}`,
          boxShadow:
            '0 30px 60px -34px color-mix(in srgb, var(--accent-deep) 32%, transparent)',
          background: [
            'radial-gradient(100% 120% at 10% 4%, rgba(255,255,255,.7), transparent 46%)',
            'radial-gradient(95% 130% at 92% 106%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 56%)',
            'radial-gradient(70% 90% at 72% 40%, color-mix(in srgb, var(--gold) 8%, transparent), transparent 60%)',
            'linear-gradient(142deg, #fef7fa 0%, var(--color-maroon-soft) 46%, #f4dbe6 100%)',
          ].join(', '),
          opacity: cardIn ? 1 : 0,
          transform: cardIn ? 'none' : 'translateY(34px)',
          transition: 'opacity 1s ease, transform 1.15s var(--ease-spring)',
          willChange: 'opacity, transform',
        }}
      >
        {/* Oversized decorative open-quote, bled off the top-left corner. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 6,
            left: 42,
            fontSize: 200,
            lineHeight: 'var(--lh-none)',
            color: 'color-mix(in srgb, var(--accent) 16%, transparent)',
            fontWeight: 'var(--fw-extrabold)',
            fontFamily: 'Georgia, serif',
            pointerEvents: 'none',
          }}
        >
          {quoteMark}
        </div>

        {/* Soft white sheen hung off the top-right of the card. */}
        {showSheen && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-55%',
              right: '-14%',
              width: '78%',
              height: '210%',
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,.5), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
        )}

        <q
          ref={quoteRef}
          style={{
            position: 'relative',
            display: 'block',
            maxWidth: 900,
            quotes: 'none',
            fontSize: 'clamp(24px, 3vw, 38px)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: '-0.03em',
            lineHeight: 1.28,
            textWrap: 'pretty',
          }}
        >
          {words.map((word, i) => (
            <React.Fragment key={i}>
              <span
                className="edp-mission-word"
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  verticalAlign: 'top',
                  padding: '0 .03em .16em',
                  margin: '0 -.03em -.16em',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    color: hlSet.has(strip(word)) ? 'var(--accent)' : 'inherit',
                    transform: quoteIn ? 'translateY(0)' : 'translateY(115%)',
                    transition: 'transform .9s var(--ease-spring)',
                    transitionDelay: `${i * wordStagger}ms`,
                    willChange: 'transform',
                  }}
                >
                  {word}
                </span>
              </span>{' '}
            </React.Fragment>
          ))}
        </q>

        <div
          style={{
            position: 'relative',
            marginTop: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`Portrait of ${attributionName}`}
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-circle)',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,.2)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: 46,
                height: 46,
                flexShrink: 0,
                borderRadius: 'var(--radius-circle)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 'var(--fw-bold)',
                fontSize: 15,
                background:
                  'linear-gradient(150deg, var(--color-maroon-mid), var(--color-maroon-deep))',
                border: '2px solid rgba(255,255,255,.2)',
              }}
            >
              {avatarInitials}
            </div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 'var(--fw-bold)' }}>{attributionName}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>
              {attributionRole}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

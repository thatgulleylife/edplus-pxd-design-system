import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * OurStory — the two-column narrative / pull-quote section from the microsite
 * (`index.html > section#our-story.os`).
 *
 * Layout: a centered `--maxw` row. Left column is the story text (eyebrow with
 * an accent rule, an oversized display quote, attribution, hairline divider, and
 * a caption + pill CTA footer). Right column is the media image, which floats in
 * from the right on its own scroll trigger.
 *
 * Motion (all faithful to the source, no named keyframes needed):
 *  1. `.sreveal` — each text block fades up 34px with a per-block transition
 *     delay, driven by an IntersectionObserver with a -15% bottom rootMargin.
 *     A second observer resets a block once it has fully dropped below the
 *     viewport so the reveal replays on the way back down.
 *  2. The quote is split into per-word masks. Words are grouped into visual
 *     lines by their measured offsetTop, and every word on the same line shares
 *     a transition-delay (`lineGap` seconds apart) so the quote rises
 *     line-by-line rather than word-by-word. Re-measured on resize.
 *  3. The media image stays fully invisible until the eyebrow's midpoint
 *     scrolls above the vertical center of the viewport, then fades and slides
 *     in from +120px. Toggling (not one-shot), so it replays on scroll-up.
 *
 * All motion is disabled under `prefers-reduced-motion: reduce`.
 */
export function OurStory({
  id = 'our-story',
  eyebrow = 'Eyebrow label',
  quote = 'A short quotation that captures the point of this section goes here.',
  attribution = '— Title, Name',
  caption = 'Short supporting caption goes here.',
  ctaLabel = 'Read the full story',
  ctaHref = '#',
  mediaSrc = '../../images/placeholders/stock-01.svg',
  mediaAlt = 'Placeholder image',
  quoteMarkSrc = null,
  showQuoteMark = true,
  lineGap = 0.14,
  style,
}) {
  const eyebrowRef = useRef(null);
  const maskRefs = useRef([]);
  const innerRefs = useRef([]);

  // Each `.sreveal` block, in DOM order: eyebrow, quote-wrap, attribution,
  // divider, footer. Index maps to the stagger delays below.
  const revealRefs = useRef([]);
  const [revealed, setRevealed] = useState([false, false, false, false, false]);
  const [mediaShown, setMediaShown] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches,
  );
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 680px)').matches,
  );

  const words = String(quote).trim().split(/\s+/).filter(Boolean);

  /* ---------- breakpoints (kept in JS so every style stays an inline object) ---------- */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mqNarrow = window.matchMedia('(max-width: 860px)');
    const mqMobile = window.matchMedia('(max-width: 680px)');
    const sync = () => {
      setIsNarrow(mqNarrow.matches);
      setIsMobile(mqMobile.matches);
    };
    sync();
    mqNarrow.addEventListener('change', sync);
    mqMobile.addEventListener('change', sync);
    return () => {
      mqNarrow.removeEventListener('change', sync);
      mqMobile.removeEventListener('change', sync);
    };
  }, []);

  /* ---------- prefers-reduced-motion ---------- */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /* ---------- scroll reveal (mirrors revealOnScroll in home.js) ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const nodes = revealRefs.current.filter(Boolean);
    if (!nodes.length) return undefined;

    if (reduced || !('IntersectionObserver' in window)) {
      setRevealed((prev) => prev.map(() => true));
      return undefined;
    }

    const indexOf = (el) => revealRefs.current.indexOf(el);
    const setAt = (i, value) =>
      setRevealed((prev) => {
        if (i < 0 || prev[i] === value) return prev;
        const next = prev.slice();
        next[i] = value;
        return next;
      });

    // Enter: trigger line pulled up 15% from the bottom edge so a block animates
    // once it is comfortably on screen. Only ever reveals.
    const ioIn = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setAt(indexOf(e.target), true);
        });
      },
      { threshold: [0], rootMargin: '0px 0px -15% 0px' },
    );

    // Reset: true viewport bottom (no rootMargin), so a block only resets once it
    // has fully dropped below the fold where the reset is invisible. Blocks
    // scrolled past the TOP stay revealed.
    const ioReset = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) return;
          const rb = e.rootBounds || { bottom: window.innerHeight };
          if (e.boundingClientRect.top >= rb.bottom - 1) setAt(indexOf(e.target), false);
        });
      },
      { threshold: 0 },
    );

    nodes.forEach((n) => {
      ioIn.observe(n);
      ioReset.observe(n);
    });
    return () => {
      ioIn.disconnect();
      ioReset.disconnect();
    };
  }, [reduced, words.length]);

  /* ---------- group quote words into visual lines and stagger per line ---------- */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const measure = () => {
      let line = -1;
      let lastTop = null;
      maskRefs.current.forEach((mask, i) => {
        const inner = innerRefs.current[i];
        if (!mask || !inner) return;
        const top = mask.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 4) {
          line += 1;
          lastTop = top;
        }
        inner.style.transitionDelay = reduced ? '0s' : `${line * lineGap}s`;
      });
    };

    measure();
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(measure, 180);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [quote, lineGap, reduced, isNarrow, isMobile]);

  /* ---------- media: hold until the eyebrow crosses the vertical midpoint ---------- */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (reduced) {
      setMediaShown(true);
      return undefined;
    }
    let ticking = false;
    const check = () => {
      ticking = false;
      const el = eyebrowRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      setMediaShown(mid <= window.innerHeight * 0.5);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', check);
    check();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', check);
    };
  }, [reduced]);

  /* ---------- shared reveal style ---------- */
  const revealStyle = (index, delaySeconds) => ({
    opacity: reduced || revealed[index] ? 1 : 0,
    transform: reduced || revealed[index] ? 'none' : 'translateY(34px)',
    transition: reduced
      ? 'none'
      : 'opacity 1s ease, transform 1.15s var(--ease-spring)',
    transitionDelay: reduced ? '0s' : `${delaySeconds}s`,
    willChange: 'opacity, transform',
  });

  const quoteIn = reduced || revealed[1];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-quote`}
      style={{
        position: 'relative',
        zIndex: 1,
        padding: isNarrow ? 'var(--space-16) 0 var(--space-5)' : '120px 0 var(--space-14)',
        fontFamily: 'var(--font)',
        ...style,
      }}
    >
      {/* Hover / focus affordances can't be expressed as inline objects. */}
      <style>{`
        .dsos-cta:hover{
          background: color-mix(in srgb, var(--accent) 6%, transparent) !important;
          border-color: var(--accent) !important;
          transform: translateY(-1px);
        }
        .dsos-cta:focus-visible{ outline: 2px solid var(--accent); outline-offset: 3px; }
        .dsos-cta .dsos-arr{ display: inline-block; transition: transform .22s; }
        .dsos-cta:hover .dsos-arr{ transform: translateX(3px); }
        @media (prefers-reduced-motion: reduce){
          .dsos-cta:hover{ transform: none; }
          .dsos-cta:hover .dsos-arr{ transform: none; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 'var(--maxw)',
          margin: '0 auto',
          padding: isMobile ? '0 var(--wrap-pad-sm)' : '0 var(--wrap-pad)',
          display: 'flex',
          flexDirection: isNarrow ? 'column' : 'row',
          alignItems: isNarrow ? 'flex-start' : 'center',
          gap: isNarrow ? 'var(--space-10)' : 'var(--space-20)',
        }}
      >
        {/* ---------------- text column ---------------- */}
        <div style={{ flex: 1, maxWidth: isNarrow ? 'none' : 650 }}>
          <div
            ref={(el) => {
              eyebrowRef.current = el;
              revealRefs.current[0] = el;
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              marginBottom: 46,
              fontSize: 13,
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-caps)',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              ...revealStyle(0, 0),
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
                flex: '0 0 auto',
              }}
            />
            {eyebrow}
          </div>

          {/* The wrapper itself never fades or slides — the masked words carry the
              motion — but it is still observed so it can drive them. */}
          <div
            ref={(el) => {
              revealRefs.current[1] = el;
            }}
            style={{ position: 'relative', margin: '0 0 22px' }}
          >
            {showQuoteMark &&
              (quoteMarkSrc ? (
                <img
                  src={quoteMarkSrc}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -30,
                    left: -8,
                    width: 100,
                    height: 'auto',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <svg
                  viewBox="0 0 100 72"
                  width="100"
                  height="72"
                  aria-hidden="true"
                  focusable="false"
                  style={{
                    position: 'absolute',
                    top: -30,
                    left: -8,
                    width: 100,
                    height: 'auto',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                >
                  <path
                    d="M0 44C0 21 12 6 32 0l4 12C24 17 18 25 18 33h14a6 6 0 0 1 6 6v27a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V44Z"
                    fill="var(--accent-soft)"
                  />
                  <path
                    transform="translate(52 0)"
                    d="M0 44C0 21 12 6 32 0l4 12C24 17 18 25 18 33h14a6 6 0 0 1 6 6v27a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V44Z"
                    fill="var(--accent-soft)"
                  />
                </svg>
              ))}

            <blockquote
              id={`${id}-quote`}
              style={{
                position: 'relative',
                zIndex: 1,
                margin: 0,
                fontSize: 'clamp(38px, 5vw, 72px)',
                fontWeight: 'var(--fw-extrabold)',
                letterSpacing: 'var(--ls-tighter)',
                lineHeight: 'var(--lh-tight)',
                color: 'var(--ink)',
                textWrap: 'pretty',
              }}
            >
              {words.map((word, i) => (
                <React.Fragment key={`${word}-${i}`}>
                  <span
                    ref={(el) => {
                      maskRefs.current[i] = el;
                    }}
                    style={{
                      display: 'inline-block',
                      overflow: 'hidden',
                      verticalAlign: 'top',
                      padding: '0 .04em .16em',
                      margin: '0 -.04em -.16em',
                    }}
                  >
                    <span
                      ref={(el) => {
                        innerRefs.current[i] = el;
                      }}
                      style={{
                        display: 'inline-block',
                        transform: quoteIn ? 'none' : 'translateY(116%)',
                        transition: reduced
                          ? 'none'
                          : 'transform .8s var(--ease-spring)',
                        willChange: 'transform',
                      }}
                    >
                      {word}
                    </span>
                  </span>{' '}
                </React.Fragment>
              ))}
            </blockquote>
          </div>

          <p
            ref={(el) => {
              revealRefs.current[2] = el;
            }}
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--fw-bold)',
              color: 'var(--ink)',
              margin: 0,
              ...revealStyle(2, 0.1),
            }}
          >
            {attribution}
          </p>

          <hr
            ref={(el) => {
              revealRefs.current[3] = el;
            }}
            style={{
              border: 'none',
              borderTop: '1px solid var(--line)',
              margin: '34px 0 0',
              ...revealStyle(3, 0.14),
            }}
          />

          <div
            ref={(el) => {
              revealRefs.current[4] = el;
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px var(--space-6)',
              marginTop: 'var(--space-6)',
              flexWrap: 'wrap',
              ...revealStyle(4, 0.16),
            }}
          >
            <span style={{ fontSize: 15, color: 'var(--muted)' }}>{caption}</span>
            <a
              className="dsos-cta"
              href={ctaHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 15,
                fontWeight: 'var(--fw-bold)',
                color: 'var(--accent)',
                fontFamily: 'var(--font)',
                textDecoration: 'none',
                background: 'transparent',
                border: '1.5px solid color-mix(in srgb, var(--accent) 42%, transparent)',
                borderRadius: 'var(--radius-pill)',
                padding: '13px 26px',
                cursor: 'pointer',
                transition: 'background .22s, border-color .22s, transform .22s',
              }}
            >
              {ctaLabel}
              <span className="dsos-arr" aria-hidden="true">
                &#8594;
              </span>
            </a>
          </div>
        </div>

        {/* ---------------- media column ---------------- */}
        <div
          style={{
            flex: 1,
            width: isNarrow ? '100%' : undefined,
            display: 'flex',
            justifyContent: 'center',
            minWidth: 0,
            opacity: reduced || mediaShown ? 1 : 0,
            transform: reduced || mediaShown ? 'none' : 'translateX(120px)',
            transition: reduced
              ? 'none'
              : 'opacity 1.1s ease, transform 1.3s var(--ease-spring)',
          }}
        >
          <img
            src={mediaSrc}
            alt={mediaAlt}
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: isNarrow ? 360 : 520,
              margin: isNarrow ? '0 auto' : undefined,
              display: 'block',
              filter:
                'drop-shadow(0 40px 70px color-mix(in srgb, var(--accent-deep) 20%, transparent))',
            }}
          />
        </div>
      </div>
    </section>
  );
}

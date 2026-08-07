import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PortfolioGrid — the portfolio / work gallery section from the live microsite
 * (`index.html > section.port#portfolio`).
 *
 * Despite the name, the source section is NOT a static grid: it is a cover-flow
 * carousel. A centered eyebrow + headline sit above an absolutely-positioned
 * stage of wide 1.65:1 cards. The active card is centered at full opacity and
 * full scale; neighbours step outward by `cardWidth + gap`, shrink by 7% of the
 * distance, and fade (1 - d*0.55 for the first step, then 0.45*(2-d) out to
 * d = 2 where they hit zero). Cards wrap around, so the ring is infinite in
 * both directions.
 *
 * Interaction, all ported 1:1 from the source's inline script:
 *  - prev / play-pause / next pill buttons below the stage
 *  - live pointer drag: cards track the finger in real time (transition is
 *    suppressed mid-drag) and settle onto the nearest card in the drag
 *    direction; a flick past 16% of a card width always advances one step
 *  - tap on a non-active card brings it to the center
 *  - autoplay steps forward every 3800ms; any manual input stops it
 *
 * Motion: pure transitions, no keyframes — transform .62s var(--ease-in-out)
 * and opacity .55s ease on the slides, plus the shared `.sreveal` scroll
 * choreography (opacity 1s / transform 1.15s var(--ease-spring), staggered
 * .08s and .16s) on the eyebrow, headline and stage. Both honor
 * prefers-reduced-motion.
 *
 * Card geometry is measured, not guessed: width = min(1180, stageWidth * 0.66)
 * on desktop and stageWidth * 0.84 under 700px; height = width / 1.65.
 */

/* Source geometry constants — do not tune without re-checking index.html. */
const CARD_RATIO = 1.65; // slide aspect ratio (w / h)
const CARD_MAX_W = 1180; // hard cap on slide width
const WIDE_FRAC = 0.66; // slide width as a fraction of the stage, >= 700px
const NARROW_FRAC = 0.84; // slide width as a fraction of the stage, < 700px
const GAP_WIDE = 14; // px between slide centers, >= 700px
const GAP_NARROW = 10; // px between slide centers, < 700px
const SCALE_FALLOFF = 0.07; // scale lost at one card of distance
const FADE_FALLOFF = 0.55; // opacity lost at one card of distance
const FLICK_FRACTION = 0.16; // drag distance (of a card) that counts as a flick
const DRAG_THRESHOLD = 6; // px of movement before a press stops being a tap

const PLACEHOLDER_ITEMS = [
  { src: '../../images/placeholders/stock-01.svg', alt: 'Placeholder project screenshot' },
  { src: '../../images/placeholders/stock-02.svg', alt: 'Placeholder project screenshot' },
  { src: '../../images/placeholders/stock-03.svg', alt: 'Placeholder project screenshot' },
  { src: '../../images/placeholders/stock-01.svg', alt: 'Placeholder project screenshot' },
  { src: '../../images/placeholders/stock-02.svg', alt: 'Placeholder project screenshot' },
  { src: '../../images/placeholders/stock-03.svg', alt: 'Placeholder project screenshot' },
];

const SCOPED_CSS = `
.pgx-btn{ -webkit-tap-highlight-color:transparent; }
.pgx-btn:hover{ border-color:#c4c4ca; color:var(--ink); }
.pgx-btn:active{ transform:scale(.93); }
.pgx-btn:focus-visible{ outline:2px solid var(--accent); outline-offset:3px; }
.pgx-slide{ -webkit-user-select:none; user-select:none; }
.pgx-slide img{ -webkit-user-drag:none; user-drag:none; pointer-events:none; }
@media (prefers-reduced-motion:reduce){
  .pgx-reveal{ opacity:1 !important; transform:none !important; transition:none !important; }
  .pgx-slide{ transition:none !important; }
}
`;

const IconPrev = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    style={{ width: 17, height: 17 }}
  >
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

const IconNext = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    style={{ width: 17, height: 17 }}
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

const IconPlay = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    aria-hidden="true"
    focusable="false"
    style={{ width: 17, height: 17 }}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const IconPause = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    aria-hidden="true"
    focusable="false"
    style={{ width: 17, height: 17 }}
  >
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export function PortfolioGrid({
  id = 'portfolio',
  eyebrow = 'Section eyebrow',
  title = 'Section headline goes here',
  items = PLACEHOLDER_ITEMS,
  autoPlay = false,
  autoPlayInterval = 3800,
  initialIndex = 0,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  playLabel = 'Play',
  pauseLabel = 'Pause',
  stageLabel = 'Portfolio gallery',
  onSlideChange,
  style,
}) {
  const slides = items && items.length ? items : PLACEHOLDER_ITEMS;
  const n = slides.length;

  const stageRef = useRef(null);
  const headingId = `${id}-title`;

  const [active, setActive] = useState(() => ((initialIndex % n) + n) % n);
  const [playing, setPlaying] = useState(autoPlay);
  const [dims, setDims] = useState({ sw: 0, aw: 0, ah: 0, gap: GAP_WIDE });
  const [narrow, setNarrow] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [revealed, setRevealed] = useState(false);

  /* ---- measurement -------------------------------------------------- */
  // aw = min(1180, sw * (sw < 700 ? .84 : .66));  ah = round(aw / 1.65)
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const sw =
      (stage && stage.getBoundingClientRect().width) ||
      (typeof window !== 'undefined' ? window.innerWidth : 0);
    const aw = Math.min(CARD_MAX_W, sw * (sw < 700 ? NARROW_FRAC : WIDE_FRAC));
    const ah = Math.round(aw / CARD_RATIO);
    setDims({ sw, aw, ah, gap: sw < 700 ? GAP_NARROW : GAP_WIDE });
    if (typeof window !== 'undefined') setNarrow(window.innerWidth <= 600);
  }, []);

  useEffect(() => {
    measure();
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('resize', measure);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(stageRef.current);
    }
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, [measure]);

  /* ---- scroll reveal (.sreveal, rootMargin 0 0 -15% 0) --------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = stageRef.current;
    if (reduce || !('IntersectionObserver' in window) || !el) {
      setRevealed(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setRevealed(true);
        });
      },
      { threshold: [0], rootMargin: '0px 0px -15% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---- navigation ---------------------------------------------------- */
  const go = useCallback(
    (i) => {
      const next = ((i % n) + n) % n;
      setDragPx(0);
      setActive(next);
      if (onSlideChange) onSlideChange(next);
    },
    [n, onSlideChange]
  );

  const stopPlay = useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (!playing) return undefined;
    const t = setInterval(() => {
      setActive((a) => {
        const next = (a + 1) % n;
        if (onSlideChange) onSlideChange(next);
        return next;
      });
    }, autoPlayInterval);
    return () => clearInterval(t);
  }, [playing, autoPlayInterval, n, onSlideChange]);

  /* ---- pointer drag --------------------------------------------------- */
  const drag = useRef({ startX: 0, startY: 0, moved: false, pid: null, px: 0 });

  const onPointerDown = (e) => {
    drag.current = { startX: e.clientX, startY: e.clientY, moved: false, pid: e.pointerId, px: 0 };
    setDragging(true);
    setDragPx(0);
    try {
      stageRef.current.setPointerCapture(e.pointerId);
    } catch (_) {
      /* pointer capture is best-effort */
    }
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const px = e.clientX - drag.current.startX;
    drag.current.px = px;
    if (Math.abs(px) > DRAG_THRESHOLD) drag.current.moved = true;
    setDragPx(px);
  };

  const endDrag = (e) => {
    if (!dragging) return;
    setDragging(false);
    try {
      if (drag.current.pid != null) stageRef.current.releasePointerCapture(drag.current.pid);
    } catch (_) {
      /* pointer capture is best-effort */
    }
    drag.current.pid = null;

    // A press that never moved is a tap: center whichever card was hit.
    if (!drag.current.moved) {
      const px = e && e.clientX != null ? e.clientX : drag.current.startX;
      const py = e && e.clientY != null ? e.clientY : drag.current.startY;
      const hit = typeof document !== 'undefined' ? document.elementFromPoint(px, py) : null;
      const card = hit && hit.closest ? hit.closest('[data-pgx-slide]') : null;
      const idx = card ? Number(card.getAttribute('data-pgx-slide')) : -1;
      if (idx >= 0 && rel(idx) !== 0) {
        go(idx);
        stopPlay();
      } else {
        setDragPx(0);
      }
      return;
    }

    // Settle to the nearest card in the drag direction; a short flick still steps one.
    const unit = dims.aw + dims.gap;
    const px = drag.current.px;
    let steps = Math.round(-px / unit);
    if (steps === 0 && Math.abs(px) > unit * FLICK_FRACTION) steps = px < 0 ? 1 : -1;
    setDragPx(0);
    if (steps !== 0) {
      go(active + steps);
      stopPlay();
    }
  };

  /* ---- per-slide layout ---------------------------------------------- */
  // Signed ring distance from the active card, wrapped to the short way round.
  function rel(i) {
    let d = i - active;
    d = ((d % n) + n) % n;
    if (d > n / 2) d -= n;
    return d;
  }

  const frac = dims.aw ? dragPx / (dims.aw + dims.gap) : 0;

  const slideTransition = dragging
    ? 'none'
    : 'transform .62s var(--ease-in-out), opacity .55s ease';

  const revealBase = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : 'translateY(34px)',
    transition: 'opacity 1s ease, transform 1.15s var(--ease-spring)',
    willChange: 'opacity, transform',
  };

  const btnStyle = {
    width: narrow ? 44 : 'var(--space-12)',
    height: narrow ? 44 : 'var(--space-12)',
    borderRadius: 'var(--radius-circle)',
    border: '1px solid var(--line)',
    background: 'var(--bg)',
    color: 'var(--ink)',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    padding: 0,
    transition:
      'border-color var(--dur-fast), color var(--dur-fast), transform var(--dur-fast), box-shadow .25s',
    boxShadow: '0 6px 16px -10px rgba(20,20,30,.3)',
  };

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        padding: narrow ? '64px 0 30px' : '104px 0 44px',
        fontFamily: 'var(--font)',
        ...style,
      }}
    >
      <style>{SCOPED_CSS}</style>

      <div
        style={{
          textAlign: 'center',
          maxWidth: 780,
          margin: `0 auto ${narrow ? 24 : 34}px`,
          padding: '0 var(--space-6)',
        }}
      >
        <div
          className="pgx-reveal"
          style={{
            ...revealBase,
            fontSize: 13,
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--ls-widest)',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {eyebrow}
        </div>
        <h2
          id={headingId}
          className="pgx-reveal"
          style={{
            ...revealBase,
            transitionDelay: '.08s',
            fontSize: 'clamp(27px, 3.5vw, 44px)',
            fontWeight: 'var(--fw-extrabold)',
            letterSpacing: 'var(--ls-tighter)',
            lineHeight: 1.08,
            color: 'var(--ink)',
            margin: '0 auto',
            maxWidth: '18ch',
            minHeight: '2.2em',
            textWrap: 'balance',
          }}
        >
          {title}
        </h2>
      </div>

      <div
        ref={stageRef}
        id={`${id}-stage`}
        className="pgx-reveal"
        role="group"
        aria-roledescription="carousel"
        aria-label={stageLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          ...revealBase,
          transitionDelay: '.16s',
          position: 'relative',
          width: '100%',
          height: dims.ah || undefined,
          touchAction: 'pan-y',
        }}
      >
        {slides.map((item, i) => {
          const off = rel(i) + frac;
          const a = Math.abs(off);
          const x = off * (dims.aw + dims.gap);
          const scale = 1 - Math.min(a, 1) * SCALE_FALLOFF;
          const opacity = a >= 2 ? 0 : a <= 1 ? 1 - a * FADE_FALLOFF : 0.45 * (2 - a);
          return (
            <div
              key={item.key || `${item.src}-${i}`}
              className="pgx-slide"
              data-pgx-slide={i}
              aria-hidden={a >= 2 ? 'true' : undefined}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: dims.aw || undefined,
                height: dims.ah || undefined,
                borderRadius: 18,
                overflow: 'hidden',
                background: '#f1ecee',
                boxShadow: 'var(--shadow-xl)',
                willChange: 'transform, opacity',
                transform: `translate(-50%,-50%) translateX(${x.toFixed(1)}px) scale(${scale.toFixed(3)})`,
                opacity: Number(opacity.toFixed(3)),
                transition: slideTransition,
                zIndex: 30 - Math.round(a * 3),
                pointerEvents: a < 1.6 ? 'auto' : 'none',
                cursor: a < 0.5 ? 'grab' : 'pointer',
              }}
            >
              <img
                src={item.src}
                alt={item.alt || ''}
                loading="lazy"
                decoding="async"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  // the source anchors portfolio crops to the top-left corner
                  objectPosition: 'left top',
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: narrow ? 14 : 18,
          marginTop: narrow ? 24 : 34,
        }}
      >
        <button
          type="button"
          className="pgx-btn"
          aria-label={prevLabel}
          aria-controls={`${id}-stage`}
          style={btnStyle}
          onClick={() => {
            go(active - 1);
            stopPlay();
          }}
        >
          <IconPrev />
        </button>
        <button
          type="button"
          className="pgx-btn"
          aria-label={playing ? pauseLabel : playLabel}
          aria-pressed={playing}
          style={btnStyle}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <IconPause /> : <IconPlay />}
        </button>
        <button
          type="button"
          className="pgx-btn"
          aria-label={nextLabel}
          aria-controls={`${id}-stage`}
          style={btnStyle}
          onClick={() => {
            go(active + 1);
            stopPlay();
          }}
        >
          <IconNext />
        </button>
      </div>
    </section>
  );
}

export default PortfolioGrid;

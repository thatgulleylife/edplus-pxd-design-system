import React, { useEffect, useRef } from 'react';

/**
 * TeamHistory — scroll-driven horizontal year strip inside a sticky viewport.
 *
 * Ported 1:1 from the live microsite's `section#team-history.th-fullbleed`.
 * The markup is a full-bleed band (`width:100vw; margin-left:calc(50% - 50vw)`)
 * whose inner rails are inset by `var(--gutter)` — the DESIGN-CONVENTIONS.md
 * full-bleed pattern — so the header, the scrubber and the first year card all
 * line up with the 1280px content column while the strip runs off the right.
 *
 * Geometry (from the source):
 *
 *   scroll container  height 600vh, position:relative
 *   sticky viewport   top:0, height:100vh, overflow:hidden, z-index:40
 *   header            padding 52px var(--gutter) 0, space-between
 *   scrubber          margin-top 36px, 2px rail + 2px accent fill + tick row
 *   strip clip        margin-top 96px, padding-left var(--gutter), overflow hidden
 *   year card         min-width 480px, padding-right 96px, padding-top 24px
 *   trailing spacer   min-width 64px (keeps the last card off the right edge)
 *
 * Motion (from the source's inline script — a rAF eased-follow, not a 1:1
 * scroll bind, so the strip glides rather than snapping to the wheel):
 *
 *   scrollable   = container.offsetHeight - innerHeight
 *   raw          = clamp01(-rect.top / scrollable)
 *   target       = clamp01((raw - LEAD) / (1 - LEAD - TAIL))   LEAD .12, TAIL .06
 *   current     += (target - current) * 0.12                   per rAF frame
 *   settle       = |target - current| < 0.0004  → snap and stop the loop
 *   pad          = computed paddingLeft of the strip clip (the gutter), else 64
 *   maxTranslate = max(0, strip.scrollWidth - (innerWidth - pad))
 *   transform    = translateX(-(current * maxTranslate))
 *   bar width    = current * 100%
 *   active tick  = round(current * (n - 1)); ticks at or before it go accent,
 *                  the active one also goes weight 800
 *
 * The LEAD/TAIL dead zones make the strip hold still right after the section
 * pins and rest on the final year before it unpins. The scroll hint fades from
 * 0.4 to 0 as soon as `raw` passes 0.02.
 *
 * Both the CSS transitions the source declares inline on the strip and the bar
 * are dropped once the script runs (`transition:'none'`) so rAF and CSS don't
 * fight — reproduced here by never setting them.
 *
 * Under `prefers-reduced-motion: reduce` the lerp is skipped: the strip still
 * tracks scroll position (that is layout, not decoration) but jumps straight to
 * the target, and the header reveal is disabled.
 */

const SCOPED_CSS = `
.th-sec{
  --th-gutter: var(--gutter, max(56px, calc(50vw - 584px)));
  width:100vw; margin-left:calc(50% - 50vw);
  background:var(--bg, #fff);
  font-family:var(--font, var(--font-sans, system-ui, sans-serif));
}
@media(max-width:680px){
  .th-sec{ --th-gutter: var(--gutter, 24px); }
}
/* mirrors the site-wide .sreveal float-up */
.th-reveal{
  opacity:0; transform:translateY(34px);
  transition:opacity 1s ease, transform 1.15s var(--ease-spring, cubic-bezier(.16,1,.3,1));
  will-change:opacity, transform;
}
.th-reveal.th-in{ opacity:1; transform:none; }
@media (prefers-reduced-motion: reduce){
  .th-reveal{ opacity:1 !important; transform:none !important; transition:none !important; }
  .th-strip, .th-bar, .th-hint{ transition:none !important; }
}
`;

/* ---------- tone map ----------
   Three well/pill treatments in the source: a maroon tint, a gold tint, and a
   solid ink "now" chip on the final entry. */
const TONES = {
  accent: {
    well: 'color-mix(in srgb, var(--accent) 10%, transparent)',
    pill: 'color-mix(in srgb, var(--accent) 8%, transparent)',
    fg: 'var(--accent)',
  },
  gold: {
    well: 'color-mix(in srgb, var(--gold) 18%, transparent)',
    pill: 'color-mix(in srgb, var(--gold) 18%, transparent)',
    fg: 'var(--color-gold-ink, #7a5a12)',
  },
  ink: {
    well: 'var(--ink)',
    pill: 'var(--ink)',
    fg: 'var(--bg)',
  },
};

/* ---------- milestone glyphs ---------- */
function MilestoneIcon({ icon }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  };
  if (icon === 'star-solid') {
    return (
      <svg {...common}>
        <path
          d="M8 1l1.5 4.5H14l-3.5 2.5 1.5 4.5L8 10 4 12.5l1.5-4.5L2 5.5h4.5L8 1z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (icon === 'trend') {
    return (
      <svg {...common}>
        <path
          d="M2 12l4-4 3 3 5-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 6h3v3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (icon === 'loop') {
    return (
      <svg {...common}>
        <path
          d="M13.5 5A6 6 0 102 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M2 6v3h3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  /* default: outlined star */
  return (
    <svg {...common}>
      <path
        d="M8 1l1.5 4.5H14l-3.5 2.5 1.5 4.5L8 10 4 12.5l1.5-4.5L2 5.5h4.5L8 1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- generic placeholder timeline ----------
   Same length (10) and same tone/icon rhythm as the live section so the pacing,
   the dead zones and the scrubber tick density all read identically. */
const DEFAULT_MILESTONES = [
  { year: '2016', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'accent', icon: 'star' },
  { year: '2017', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'accent', icon: 'star' },
  { year: '2018', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'gold', icon: 'trend' },
  { year: '2019', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'gold', icon: 'trend' },
  { year: '2020', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'gold', icon: 'loop' },
  { year: '2021', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'gold', icon: 'trend' },
  { year: '2022', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'accent', icon: 'star' },
  { year: '2023', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'accent', icon: 'star' },
  { year: '2024', tag: 'Metric label', title: 'Milestone headline', description: 'One or two sentences describing what happened in this year and why it mattered.', tone: 'gold', icon: 'trend' },
  { year: '2025', tag: 'Now', title: 'Milestone headline', description: 'One or two sentences describing where the story stands today.', tone: 'ink', icon: 'star-solid' },
];

export function TeamHistory({
  eyebrow = 'Eyebrow label',
  title = 'Section headline goes here\nover two lines.',
  milestones = DEFAULT_MILESTONES,
  scrollHintLabel = 'Scroll',
  showScrollHint = true,
  showScrubber = true,
  scrollDepth = '600vh',
  itemWidth = 480,
  itemGap = 96,
  trailingSpace = 64,
  leadHold = 0.12,
  tailHold = 0.06,
  follow = 0.12,
  onProgress,
  sectionId = 'team-history',
  style,
}) {
  const items = milestones && milestones.length ? milestones : DEFAULT_MILESTONES;
  const count = items.length;

  const containerRef = useRef(null);
  const clipRef = useRef(null);
  const stripRef = useRef(null);
  const barRef = useRef(null);
  const tickRowRef = useRef(null);
  const hintRef = useRef(null);
  const headRef = useRef(null);

  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  /* ---------- header float-up reveal (site-wide .sreveal parity) ---------- */
  useEffect(() => {
    const el = headRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('th-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---------- scroll → strip translate (rAF eased follow) ---------- */
  useEffect(() => {
    const container = containerRef.current;
    const strip = stripRef.current;
    if (!container || !strip) return undefined;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let target = 0;
    let current = 0;
    let raf = null;

    function render(p) {
      const stripWidth = strip.scrollWidth;
      const clip = clipRef.current;
      const pad = clip
        ? parseFloat(window.getComputedStyle(clip).paddingLeft) || 64
        : 64;
      const viewWidth = window.innerWidth - pad; // account for the left gutter
      const maxTranslate = Math.max(0, stripWidth - viewWidth);
      strip.style.transform = `translateX(-${p * maxTranslate}px)`;

      if (barRef.current) barRef.current.style.width = `${p * 100}%`;

      if (tickRowRef.current) {
        const idx = Math.round(p * (count - 1));
        const ticks = tickRowRef.current.children;
        for (let i = 0; i < ticks.length; i += 1) {
          ticks[i].style.color =
            i <= idx
              ? 'var(--accent)'
              : 'color-mix(in srgb, var(--muted) 50%, var(--bg))';
          ticks[i].style.fontWeight =
            i === idx ? 'var(--fw-extrabold, 800)' : 'var(--fw-semibold, 600)';
        }
      }

      if (onProgressRef.current) onProgressRef.current(p);
    }

    function tick() {
      current += (target - current) * follow; // ease toward the scroll target
      if (Math.abs(target - current) < 0.0004) {
        // settled — stop the loop
        current = target;
        render(current);
        raf = null;
        return;
      }
      render(current);
      raf = requestAnimationFrame(tick);
    }

    function readTarget() {
      const rect = container.getBoundingClientRect();
      const scrollable = container.offsetHeight - window.innerHeight;
      const raw = Math.max(0, Math.min(1, -rect.top / scrollable));
      target = Math.max(
        0,
        Math.min(1, (raw - leadHold) / (1 - leadHold - tailHold))
      );
      if (hintRef.current) {
        hintRef.current.style.opacity = raw > 0.02 ? '0' : '0.4';
      }
      if (reduced) {
        current = target;
        render(current);
        return;
      }
      if (raf === null) raf = requestAnimationFrame(tick);
    }

    function onResize() {
      readTarget();
      render(current);
    }

    window.addEventListener('scroll', readTarget, { passive: true });
    window.addEventListener('resize', onResize);
    readTarget();
    render(0);

    return () => {
      window.removeEventListener('scroll', readTarget);
      window.removeEventListener('resize', onResize);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [count, leadHold, tailHold, follow]);

  const titleLines = String(title).split('\n');

  return (
    <section id={sectionId} className="th-sec" style={style}>
      <style>{SCOPED_CSS}</style>

      {/* Tall scroll container — scroll drives the timeline */}
      <div
        ref={containerRef}
        style={{ position: 'relative', height: scrollDepth }}
      >
        {/* Sticky viewport — pins to the very top so the title leads */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--bg)',
            zIndex: 40,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '52px var(--th-gutter) 0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div ref={headRef} className="th-reveal">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: '26px',
                    height: '2px',
                    borderRadius: '2px',
                    background: 'var(--accent)',
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 'var(--fw-bold, 700)',
                    letterSpacing: 'var(--ls-caps, 0.16em)',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                  }}
                >
                  {eyebrow}
                </span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 'clamp(28px, 3.4vw, 46px)',
                  fontWeight: 'var(--fw-extrabold, 800)',
                  lineHeight: 1.02,
                  letterSpacing: 'var(--ls-tighter, -0.035em)',
                  color: 'var(--ink)',
                }}
              >
                {titleLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h2>
            </div>

            {/* Scroll hint */}
            {showScrollHint && (
              <div
                ref={hintRef}
                className="th-hint"
                aria-hidden="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  opacity: 0.4,
                  color: 'var(--ink)',
                  transition: 'opacity var(--dur-normal, 350ms) ease',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 'var(--fw-semibold, 600)',
                    letterSpacing: 'var(--ls-wider, 0.06em)',
                    textTransform: 'uppercase',
                  }}
                >
                  {scrollHintLabel}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" focusable="false">
                  <path
                    d="M8 3v10M4 9l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Progress scrubber */}
          {showScrubber && (
            <div
              style={{
                padding: '0 var(--th-gutter)',
                marginTop: '36px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: 'var(--line)',
                  borderRadius: '1px',
                  position: 'relative',
                }}
              >
                <div
                  ref={barRef}
                  className="th-bar"
                  style={{
                    height: '2px',
                    background: 'var(--accent)',
                    borderRadius: '1px',
                    width: '0%',
                  }}
                />
                {/* Year ticks */}
                <div
                  ref={tickRowRef}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  {items.map((m, i) => (
                    <span
                      key={`${m.year}-${i}`}
                      style={{
                        fontSize: '10px',
                        fontWeight: 'var(--fw-semibold, 600)',
                        color: 'color-mix(in srgb, var(--muted) 50%, var(--bg))',
                        transform: 'translateX(-50%)',
                        transition: 'color var(--dur-fast, 200ms) ease',
                      }}
                    >
                      {m.year}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Horizontal year strip (clipped) */}
          <div
            ref={clipRef}
            style={{
              overflow: 'hidden',
              marginTop: '96px',
              paddingLeft: 'var(--th-gutter)',
            }}
          >
            <ol
              ref={stripRef}
              className="th-strip"
              style={{
                display: 'flex',
                gap: 0,
                margin: 0,
                padding: 0,
                listStyle: 'none',
                willChange: 'transform',
              }}
            >
              {items.map((m, i) => {
                const tone = TONES[m.tone] || TONES.accent;
                return (
                  <li
                    key={`${m.year}-${i}`}
                    style={{
                      minWidth: `${itemWidth}px`,
                      paddingRight: `${itemGap}px`,
                      paddingTop: '24px',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-circle, 50%)',
                        background: tone.well,
                        color: tone.fg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '28px',
                      }}
                    >
                      <MilestoneIcon icon={m.icon} />
                    </div>

                    <div
                      style={{
                        fontSize: '64px',
                        fontWeight: 'var(--fw-extrabold, 800)',
                        letterSpacing: '-0.04em',
                        lineHeight: 'var(--lh-none, 1)',
                        color: 'var(--ink)',
                        marginBottom: '14px',
                      }}
                    >
                      {m.year}
                    </div>

                    {m.tag && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '10px',
                          fontWeight: 'var(--fw-bold, 700)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-pill, 999px)',
                          background: tone.pill,
                          color: tone.fg,
                          marginBottom: '12px',
                        }}
                      >
                        {m.tag}
                      </div>
                    )}

                    <h3
                      style={{
                        margin: '0 0 16px',
                        fontSize: '18px',
                        fontWeight: 'var(--fw-extrabold, 800)',
                        color: 'var(--ink)',
                        lineHeight: 1.3,
                      }}
                    >
                      {m.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: 'var(--muted)',
                        lineHeight: 1.75,
                        maxWidth: '300px',
                      }}
                    >
                      {m.description}
                    </p>
                  </li>
                );
              })}

              {/* Spacer so the last card isn't flush right */}
              <li
                aria-hidden="true"
                style={{ minWidth: `${trailingSpace}px`, flexShrink: 0 }}
              />
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

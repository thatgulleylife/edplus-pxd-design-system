import React from 'react';

/* ============================================================================
   TeamsBlock — EdPlus P&XD design system
   Ported from section#teams.block (.sec-head + .tgrid/.tbox) of the P&XD
   microsite. A 4-up grid of clickable team tiles, each with an icon well,
   team name, lead name + role, a hover-revealed "more" affordance, and a
   radial blob that blooms out of the top-right corner on hover.

   Geometry preserved from source CSS:
     .tgrid  grid, repeat(4,1fr), gap 16px, perspective 1300px
             ≤1000px → 2 cols · ≤520px → 1 col
     .tbox   min-height 224px, radius 20px, padding 24px 22px 22px
             hover: translateY(-12px) rotate(-2.5deg) + deep shadow
             entrance: cardRise 1.05s ease-spring backwards, 90ms column stagger
     .ticon  48×48, radius 14px, accent-soft well; hover scale(1.1) rotate(-6deg)
     .tblob  120×120 circle at top:-30px right:-30px; scale(.5)→scale(1.45)
   ============================================================================ */

/* ---------- icon glyphs (generic line icons, 24×24 stroke) ---------- */
const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  style: { width: 25, height: 25 },
  'aria-hidden': 'true',
  focusable: 'false',
};

export const TEAM_ICONS = {
  database: (
    <svg {...svgProps}>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      <path d="M4 11.5v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  ),
  layout: (
    <svg {...svgProps}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
  sparkle: (
    <svg {...svgProps} strokeWidth={1.6}>
      <path d="M12 3l1.9 4.9L19 9.8l-5.1 1.9L12 16.6l-1.9-4.9L5 9.8l5.1-1.9z" />
      <path d="M18.5 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" />
    </svg>
  ),
  search: (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
      <path d="M11 8a3 3 0 0 0-3 3" />
    </svg>
  ),
  code: (
    <svg {...svgProps}>
      <path d="M8 7l-5 5 5 5" />
      <path d="M16 7l5 5-5 5" />
      <path d="M13 4l-2 16" />
    </svg>
  ),
  journey: (
    <svg {...svgProps}>
      <circle cx="6" cy="19" r="2.4" />
      <circle cx="18" cy="5" r="2.4" />
      <path d="M8.2 17.5C13 15 11 9 15.8 6.5" />
    </svg>
  ),
  bulb: (
    <svg {...svgProps}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8.9.9 1.5l.1.7h5.2l.1-.7c.1-.6.4-1.1.9-1.5A6 6 0 0 0 12 3z" />
    </svg>
  ),
  rocket: (
    <svg {...svgProps}>
      <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8.9-2 .2-2.8l-.4-.4c-.8-.7-2-.6-2.8.2z" />
      <path d="M9 13c2.5-5 6-7 11-7 0 5-2 8.5-7 11z" />
      <circle cx="14.5" cy="9.5" r="1.5" />
    </svg>
  ),
};

/* ---------- generic placeholder data (no real people, orgs or headcounts) ---------- */
const DEFAULT_TEAMS = [
  { id: 't1', team: 'Team One', lead: 'Alex Doe', role: 'Role title goes here', icon: 'database' },
  { id: 't2', team: 'Team Two', lead: 'Jordan Doe', role: 'Role title goes here', icon: 'layout' },
  { id: 't3', team: 'Team Three', lead: 'Riley Doe', role: 'Role title goes here', icon: 'sparkle' },
  { id: 't4', team: 'Team Four', lead: 'Casey Doe', role: 'Role title goes here', icon: 'search' },
  { id: 't5', team: 'Team Five', lead: 'Morgan Doe', role: 'Role title goes here', icon: 'code' },
  { id: 't6', team: 'Team Six', lead: 'Taylor Doe', role: 'Role title goes here', icon: 'journey' },
  { id: 't7', team: 'Team Seven', lead: 'Jamie Doe', role: 'Role title goes here', icon: 'bulb' },
  { id: 't8', team: 'Team Eight', lead: 'Quinn Doe', role: 'Role title goes here', icon: 'rocket' },
];

let uidSeq = 0;

/* Renders a string with '\n' as hard line breaks (source used <br/> in the h2). */
function withBreaks(text) {
  const parts = String(text == null ? '' : text).split('\n');
  return parts.map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 ? <br /> : null}
      {line}
    </React.Fragment>
  ));
}

export function TeamsBlock({
  id = 'teams',
  eyebrow = 'Section eyebrow',
  heading = 'Section headline\ngoes right here.',
  subhead = 'Supporting sentence that explains what this grid of tiles is for and what happens when you tap one.',
  teams = DEFAULT_TEAMS,
  columns = 4,
  moreLabelPrefix = 'Meet',
  moreLabel = null,
  showHeadcount = false,
  headcountSuffix = '',
  contained = true,
  maxWidth = 1280,
  revealOnScroll = true,
  onTeamSelect = null,
  style = {},
  className = '',
  ...rest
}) {
  const uid = React.useMemo(() => 'edp-teams-' + (++uidSeq), []);
  const sectionRef = React.useRef(null);
  const [revealed, setRevealed] = React.useState(() => !revealOnScroll);
  const [hovered, setHovered] = React.useState(-1);
  const [focused, setFocused] = React.useState(-1);

  /* --- scroll reveal, mirroring home.js revealOnScroll():
         trigger line pulled up 15% from the viewport bottom; only resets once the
         element has fully dropped below the true viewport bottom (off-screen). --- */
  React.useEffect(() => {
    if (!revealOnScroll) { setRevealed(true); return undefined; }
    const node = sectionRef.current;
    if (!node) return undefined;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') { setRevealed(true); return undefined; }

    const ioIn = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setRevealed(true); }); },
      { threshold: [0], rootMargin: '0px 0px -15% 0px' }
    );
    const ioReset = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) return;
          const rb = e.rootBounds || { bottom: window.innerHeight };
          if (e.boundingClientRect.top >= rb.bottom - 1) setRevealed(false);
        });
      },
      { threshold: 0 }
    );
    ioIn.observe(node);
    ioReset.observe(node);
    return () => { ioIn.disconnect(); ioReset.disconnect(); };
  }, [revealOnScroll]);

  /* ---------- static style objects ---------- */
  const sectionStyle = {
    padding: 'var(--section-gap, 96px) 0 0',
    scrollMarginTop: 80,
    fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif)',
    color: 'var(--ink)',
    ...style,
  };

  const wrapStyle = contained
    ? { maxWidth: typeof maxWidth === 'number' ? maxWidth + 'px' : maxWidth, margin: '0 auto' }
    : {};

  const revealStyle = (delay) => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : 'translateY(34px)',
    transition:
      'opacity var(--dur-enter, 1s) ease, transform 1.15s var(--ease-spring, cubic-bezier(.16,1,.3,1))',
    transitionDelay: delay,
    willChange: 'opacity, transform',
  });

  const secHeadStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 'var(--space-6, 24px)',
    flexWrap: 'wrap',
    margin: '0 0 36px',
  };

  const secTagStyle = {
    fontSize: 13,
    fontWeight: 'var(--fw-bold, 700)',
    letterSpacing: 'var(--ls-widest, .14em)',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  };

  const h2Style = {
    fontSize: 'clamp(28px, 3.4vw, 46px)',
    fontWeight: 'var(--fw-extrabold, 800)',
    letterSpacing: 'var(--ls-tighter, -0.035em)',
    margin: '12px 0 0',
    lineHeight: 1.02,
  };

  const subStyle = {
    color: 'var(--muted)',
    fontSize: 16.5,
    margin: '10px 0 0',
    maxWidth: 430,
    textWrap: 'pretty',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(' + columns + ', 1fr)',
    gap: 'var(--grid-gap, 16px)',
    perspective: '1300px',
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={(uid + ' edp-teams-block ' + className).trim()}
      style={sectionStyle}
      {...rest}
    >
      {/* Hover / focus / entrance behaviour that inline styles cannot express.
          Scoped to this instance's generated class. */}
      <style>{`
        .${uid} .edp-tbox:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
        @media (max-width:1280px){ .${uid} .edp-tteam{ font-size:26px; } }
        @media (max-width:1140px){ .${uid} .edp-tteam{ font-size:23px; } }
        @media (max-width:1040px){ .${uid} .edp-tteam{ font-size:21px; } }
        @media (max-width:1000px){
          .${uid} .edp-tgrid{ grid-template-columns:repeat(${Math.min(columns, 2)},1fr); }
          .${uid} .edp-tteam{ font-size:27px; }
        }
        @media (max-width:560px){ .${uid} .edp-tteam{ font-size:24px; } }
        @media (max-width:520px){ .${uid} .edp-tgrid{ grid-template-columns:1fr; } }
        @media (prefers-reduced-motion: reduce){
          .${uid} .edp-sreveal, .${uid} .edp-tbox{
            opacity:1 !important; transform:none !important; animation:none !important;
          }
        }
      `}</style>

      <div style={wrapStyle}>
        {/* ---------- section head ---------- */}
        <div style={secHeadStyle}>
          <div className="edp-sreveal" style={revealStyle('0s')}>
            {eyebrow ? <div style={secTagStyle}>{eyebrow}</div> : null}
            {heading ? <h2 style={h2Style}>{withBreaks(heading)}</h2> : null}
          </div>
          {subhead ? (
            <p className="edp-sreveal" style={{ ...subStyle, ...revealStyle('.1s') }}>
              {subhead}
            </p>
          ) : null}
        </div>

        {/* ---------- team tiles ---------- */}
        <div className="edp-tgrid" style={gridStyle}>
          {teams.map((t, i) => {
            const key = t.id || t.slug || t.team || i;
            const isHot = hovered === i;
            const isFocus = focused === i;
            const Tag = t.href ? 'a' : 'button';

            const firstName = String(t.lead || '').trim().split(/\s+/)[0] || '';
            const more =
              t.moreLabel ||
              moreLabel ||
              (firstName ? moreLabelPrefix + ' ' + firstName : moreLabelPrefix);

            const boxStyle = {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg, #fff)',
              border: '1px solid ' + (isHot ? '#e2e2e6' : 'var(--line)'),
              borderRadius: 'var(--radius-lg, 20px)',
              padding: '24px 22px 22px',
              minHeight: 224,
              overflow: 'hidden',
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',
              color: 'inherit',
              width: '100%',
              textDecoration: 'none',
              transformStyle: 'preserve-3d',
              transition:
                'transform .4s var(--ease-bounce, cubic-bezier(.34,1.4,.5,1)), box-shadow .35s, border-color .35s',
              boxShadow: isHot ? 'var(--shadow-maroon-hover, 0 38px 64px -26px rgba(20,20,30,.44))' : 'none',
              opacity: revealed ? 1 : 0,
              transform: revealed ? (isHot ? 'translateY(-12px) rotate(-2.5deg)' : 'none') : 'translateY(26px)',
              animation: revealed
                ? 'cardRise 1.05s var(--ease-spring, cubic-bezier(.16,1,.3,1)) backwards'
                : 'none',
              animationDelay: (i % Math.max(columns, 1)) * 90 + 'ms',
            };

            return (
              <Tag
                key={key}
                className="edp-tbox"
                type={t.href ? undefined : 'button'}
                href={t.href || undefined}
                style={boxStyle}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? -1 : h))}
                onFocus={() => setFocused(i)}
                onBlur={() => setFocused((f) => (f === i ? -1 : f))}
                onClick={onTeamSelect ? (e) => onTeamSelect(t, i, e) : undefined}
              >
                {/* corner blob */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: 'var(--radius-circle, 50%)',
                    background:
                      'radial-gradient(circle at 30% 30%, var(--accent-soft), transparent 70%)',
                    transform: isHot ? 'scale(1.45)' : 'scale(.5)',
                    opacity: isHot ? 1 : 0,
                    transition:
                      'transform .55s var(--ease-out, cubic-bezier(.2,.8,.2,1)), opacity .55s',
                    pointerEvents: 'none',
                  }}
                />

                {/* head: icon well (+ optional headcount chip) */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 10,
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md, 14px)',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      display: 'grid',
                      placeItems: 'center',
                      flex: 'none',
                      transform: isHot ? 'scale(1.1) rotate(-6deg)' : 'none',
                      transition: 'transform .4s var(--ease-magnetic, cubic-bezier(.2,1.5,.4,1))',
                    }}
                  >
                    {t.iconNode || TEAM_ICONS[t.icon] || TEAM_ICONS.layout}
                  </span>

                  {showHeadcount && t.count != null ? (
                    <span
                      style={{
                        fontSize: 'var(--text-xs, 12px)',
                        fontWeight: 'var(--fw-extrabold, 800)',
                        color: 'var(--accent)',
                        background: 'var(--accent-soft)',
                        borderRadius: 'var(--radius-pill, 999px)',
                        padding: '5px 11px',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {t.count}
                      {headcountSuffix}
                    </span>
                  ) : null}
                </span>

                {/* team name */}
                <span
                  className="edp-tteam"
                  style={{
                    position: 'relative',
                    fontSize: 29,
                    fontWeight: 'var(--fw-extrabold, 800)',
                    letterSpacing: '-0.03em',
                    color: 'var(--ink)',
                    marginTop: 22,
                    lineHeight: 1.06,
                    textWrap: 'balance',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {t.team}
                </span>

                {/* lead + role */}
                {t.lead ? (
                  <span
                    style={{
                      position: 'relative',
                      fontSize: 14.5,
                      fontWeight: 'var(--fw-bold, 700)',
                      letterSpacing: '-0.01em',
                      color: 'var(--ink-2, var(--ink))',
                      marginTop: 12,
                      lineHeight: 1.2,
                    }}
                  >
                    {t.lead}
                  </span>
                ) : null}
                {t.role ? (
                  <span
                    style={{
                      position: 'relative',
                      fontSize: 13,
                      color: 'var(--muted)',
                      marginTop: 4,
                      lineHeight: 1.36,
                    }}
                  >
                    {t.role}
                  </span>
                ) : null}

                {/* hover-revealed affordance */}
                <span
                  style={{
                    position: 'relative',
                    marginTop: 'auto',
                    paddingTop: 16,
                    fontSize: 13,
                    fontWeight: 'var(--fw-bold, 700)',
                    color: 'var(--accent)',
                    display: 'inline-flex',
                    gap: 6,
                    opacity: isHot || isFocus ? 1 : 0,
                    transform: isHot || isFocus ? 'none' : 'translateX(-5px)',
                    transition: 'opacity .25s ease, transform .25s ease',
                  }}
                >
                  {more} <span aria-hidden="true">&rarr;</span>
                </span>
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TeamsBlock;
